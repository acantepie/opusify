# coding: utf-8

from model import Track, Config, YoutubeDownloadResult
from yt_dlp import YoutubeDL, postprocessor
from model import Track, Config

import utils
import subprocess
import os
from pathlib import Path


class FilePathPP(postprocessor.PostProcessor):
    result: YoutubeDownloadResult = None

    def __init__(self, result: YoutubeDownloadResult):
        self.result = result
        super().__init__()

    def run(self, info):
        self.result.filepath = info['filepath']
        self.result.filename = os.path.basename(info['filepath'])

        return [], info

class TrackTaggerPP(postprocessor.PostProcessor):
    track: Track = None
    config: Config = None

    def __init__(self, track: track, config: Config):
        self.track = track
        self.config = config
        super().__init__()

    def run(self, info):
        path = info['filepath']
        outputPath = os.path.join(os.path.dirname(path), '_tag_' + os.path.basename(path))

        params = []

        # binary
        params.append(self.config.ffmepLocation)

        # verbosity
        if not self.config.debug:
            params.append('-loglevel')
            params.append('quiet')

        # input path
        params.append('-i')
        params.append(path)

        # Write id3v1 metadata also since Windows Explorer can't handle id3v2 tags
        params.append('-write_id3v1')
        params.append('1')

        # metadata
        metadatas = self.generate_metadatas()

        # stop here if no metadata to add
        if len(metadatas) == 0:
            return [], info

        for k,v in metadatas.items():
            params.append('-metadata')  
            params.append('%s=%s' % (k, v))

        # output codec
        params.append('-c')
        params.append('copy')

        # owewrite output
        params.append('-y')

        # output path
        params.append(outputPath)

        if self.config.debug:
            utils.log(params)

        result = subprocess.run(params)

        # success
        if 0 == result.returncode:
            # Must delete file before to avoid drama
            pyPath = Path(path)
            pyPath.unlink(missing_ok=True)

            # Not cross platform at all - will fail on windows if file exist
            os.replace(outputPath, path)
            return [], info
        else:
            raise NameError('Unable to tag file')

    def generate_metadatas(self):
        # Info on media metadata/metadata supported by ffmpeg:
        # https://wiki.multimedia.cx/index.php/FFmpeg_Metadata
        # https://kdenlive.org/en/project/adding-meta-data-to-mp4-video/
        # https://kodi.wiki/view/Video_file_tagging

        metadatas = {}

        if self.track.title:
            metadatas['title'] = self.track.title

        if self.track.album:
            metadatas['album'] = self.track.album

        if self.track.hasArtist():
            metadatas['artist'] = self.track.stringifyArtists()

        if self.track.year:
            metadatas['date'] = self.track.year

        if self.track.sequence:
            metadatas['track'] = self.track.sequence

        return metadatas

class YoutubeDownload:

    youtubeId: str = None
    track: Track = None
    config: Config = None

    def __init__(self, youtubeId: str, track: Track, config: Config):
        self.youtubeId = youtubeId
        self.track = track
        self.config = config

    def download(self):
        result = YoutubeDownloadResult()

        options = {
            'noplaylist': True,
            'format': 'bestaudio/best',
            'logtostderr': True,
            'overwrites': None,
            'ffmpeg_location': self.config.ffmepLocation,
            'keepvideo': self.config.keepVideo,
            'postprocessors': []
        }

        if self.config.outputTmpl:
            options['outtmpl'] = self.config.outputTmpl

        # Audio Extract PP
        extractOptions = {
            'key': 'FFmpegExtractAudio'
        }

        if self.config.audioCodec:
            extractOptions['preferredcodec'] = self.config.audioCodec

        if self.config.audioQuality: 
            extractOptions['preferredquality'] = self.config.audioQuality

        options['postprocessors'].append(extractOptions)

        # Metadata PP
        if self.config.metadata == 'youtube':
            options['postprocessors'].append({
                'key': 'FFmpegMetadata'
            })


        if not self.config.debug:
            options['noprogress'] = True
            options['quiet'] = True

        if self.config.cacheDir:
            options['cachedir'] = self.config.cacheDir


        ytdl = YoutubeDL(options)

        if self.config.metadata == 'input':
            ytdl.add_post_processor(TrackTaggerPP(self.track, self.config), when='post_process')

        ytdl.add_post_processor(FilePathPP(result), when='post_process')


        ytdl.download([self.youtubeId])
        return result
