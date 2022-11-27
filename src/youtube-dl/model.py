# coding: utf-8

from enum import Enum
from json import dumps

class Track: 
    title: str = None
    artists: list = []
    album: str = None
    duration: int = 0 # in s
    sequence: int = None # Used for tagging
    year: int = None # Used only for tagging

    def hasArtist(self):
        return self.artists and len(self.artists) > 0

    def stringifyArtists(self, separator = ', '):
        if not self.hasArtist(): return ''

        names = map(lambda a: a.strip(), self.artists)
        return separator.join(names)

class Config:
    debug: bool = False
    ffmepLocation: str = 'ffmpeg'

    searchLimit: int = None
    searchMinScore: int = None

    outputTmpl: str = None
    audioCodec: str = None
    audioQuality: int = None
    cacheDir: str = None
    keepVideo: bool = False

    metadata: str = 'none'

class YoutubeSearchResult(object):
    youtubeId: str = None
    data = None
    score: int = None

class YoutubeDownloadResult(object):
    filename: str = None
    filepath: str = None

class Result(object):
    searchResult: YoutubeSearchResult = None
    downloadResult: YoutubeDownloadResult = None

    def toJSON(self):
        return dumps(self, default=lambda o: o.__dict__, indent=4)