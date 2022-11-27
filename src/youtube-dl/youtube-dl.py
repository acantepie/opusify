#!/usr/bin/env python3
# coding: utf-8

from argparse import ArgumentParser
from YoutubeSearch import YoutubeSearch
from YoutubeDownload import YoutubeDownload
from model import Track, Config, Result

# packages
# yt-dlp
# ytmusicapi
# rapidfuzz

if __name__ == "__main__":
    parser = ArgumentParser()

    parser.add_argument('--title', type=str)
    parser.add_argument('--artist', type=str, nargs='+')
    parser.add_argument('--album', type=str)
    parser.add_argument('--duration', type=int, default=0)
    parser.add_argument('--sequence', type=int)
    parser.add_argument('--year', type=int)

    parser.add_argument('--youtube-id', type=str)
    parser.add_argument('--search-limit', type=int, default=10)
    parser.add_argument('--search-min-score', type=int, default=70)

    parser.add_argument('--ffmpeg-location', type=str, default='/usr/bin/ffmpeg')

    # exemple : my/path/foo.%(ext)s
    parser.add_argument('-o', '--output-tmpl', type=str)

    parser.add_argument('--cache-dir', type=str)

    # supported audio codec : aac, flac, mp3, opus, vorbis, wav
    parser.add_argument('-c', '--audio-codec', type=str)
    parser.add_argument('-q', '--audio-quality', type=int)
    parser.add_argument('-k', '--keep-video', action='store_true')

    parser.add_argument('--metadata', choices=['input', 'youtube', 'no'], default='no')

    parser.add_argument('--debug', action='store_true')

    args = parser.parse_args()

    config = Config()
    config.debug = args.debug
    config.searchLimit = args.search_limit
    config.searchMinScore = args.search_min_score

    config.ffmepLocation = args.ffmpeg_location
    config.outputTmpl = args.output_tmpl
    config.audioCodec = args.audio_codec
    config.audioQuality = args.audio_quality
    config.keepVideo = args.keep_video
    config.cacheDir = args.cache_dir

    config.metadata = args.metadata

    track = Track()
    track.title = args.title
    track.artists = args.artist
    track.album = args.album
    track.duration = args.duration
    track.sequence = args.sequence
    track.year = args.year
    
    youtubeId = args.youtube_id

    result = Result()

    # try search youtubeId
    if not youtubeId:
        if not track.title: raise NameError('Track title is required in no youtube-id provided.')
        search = YoutubeSearch(track, config)
        result.searchResult = search.search()
        youtubeId = result.searchResult.youtubeId

    if not youtubeId: raise NameError('No youtube video found for this track.')

    dl = YoutubeDownload(youtubeId, track, config)
    result.downloadResult = dl.download()
    
    # dump result
    print(result.toJSON())
