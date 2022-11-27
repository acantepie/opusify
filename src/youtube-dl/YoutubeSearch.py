# coding: utf-8

from model import Track, Config, YoutubeSearchResult
import utils

from ytmusicapi import YTMusic  # https://github.com/sigma67/ytmusicapi
from rapidfuzz import fuzz  # https://github.com/maxbachmann/RapidFuzz

class YoutubeSearch:

    track: Track = None
    config: Config = None
    ytmusic: YTMusic = None

    def __init__(self, track: Track, config: Config):
        self.track = track
        self.config = config
        self.ytmusic = YTMusic()

    def search(self):

        # Build query
        if self.track.hasArtist():
            query = '%s - %s' % (self.track.title, self.track.stringifyArtists())
        else:
            query = self.track.title

        # Do query
        data = self.ytmusic.search(query, filter='songs', limit=self.config.searchLimit)

        bestScore = -1
        bestMatch = None

        for item in data:
            score = self._score(item)
            if (score >= self.config.searchMinScore and score > bestScore):
                bestScore = score
                bestMatch = item

        # Create result
        result = YoutubeSearchResult()
        result.score = bestScore
        result.data = bestMatch
        result.youtubeId = bestMatch['videoId'] if bestMatch else None

        return result

    def _score(self, data):
        scoreList = []

        s = self.title_score(data)
        if s: scoreList.append(s)

        s = self.artist_score(data)
        if s: scoreList.append(s)

        s = self.album_score(data)
        if s: scoreList.append(s)

        s = self.duration_score(data)
        if s: scoreList.append(s)


        sum_score = 0
        sum_weight = 0
        for s in scoreList: 
            sum_score += s['similarity'] * s['weight']
            sum_weight += s['weight']

        score = round(sum_score / sum_weight)

        if self.config.debug:
            utils.log('>>> Youtube search')
            for s in scoreList: 
                utils.log(' [%s]  \t %d : %s // %s' % (s['name'], s['similarity'], s['source'], s['match']))
            utils.log(' [total] \t %d' % score)

        return score

    def title_score(self, data):
        similarity = round((fuzz.partial_token_ratio(self.track.title, data['title']) * 6 + fuzz.token_ratio(self.track.title, data['title']) * 4) / 10)

        return {
            'name': 'title',
            'source':  self.track.title,
            'match':  data['title'],
            'similarity': similarity,
            'weight': 5
        }

    def artist_score(self, data):
        if not self.track.hasArtist():
            return None

        trackArtist = self.track.stringifyArtists('||')

        ytArtistList = []
        for a in data['artists']:
            name = a['name'].strip() if 'name' in a else ''
            if name: ytArtistList.append(name)

        ytArtist = '||'.join(ytArtistList)

        return {
            'name': 'artist',
            'source': trackArtist,
            'match':  ytArtist,
            'similarity': fuzz.partial_token_ratio(trackArtist, ytArtist),
            'weight': 2
        }

    def album_score(self, data):
        if not self.track.album:
            return None

        ytAlbum = data['album']['name'] if data['album'] else ''
        return {
            'name': 'album',
            'source':  self.track.album,
            'match':  ytAlbum,
            'similarity': fuzz.partial_token_ratio(self.track.album, ytAlbum),
            'weight': 1
        }

    def duration_score(self, data):
        if self.track.duration <= 0:
            return None

        # if diff is greater than 30s => score will be zero

        # diff in s between two duration
        diff = abs(self.track.duration - data['duration_seconds'])

        score = max(0, 30 - diff)  # score / 30
        score = round(score * 100 / 30)  # score / 100

        return {
            'name': 'duration',
            'source': self.track.duration,
            'match':  data['duration_seconds'],
            'similarity': score,
            'weight': 2
        }