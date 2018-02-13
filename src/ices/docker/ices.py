#!/usr/bin/env python
import redis

# This is just a skeleton, something for you to start with.
r = None
silence = '/songs/10-sec-of-silence.mp3'


# Function called to initialize your python environment.
# Should return 1 if ok, and 0 if something went wrong.
def ices_init():
    global r, silence
    r = redis.StrictRedis(host='redis', port=6379, db=0)
    r.set('next_song', silence)
    return 1


# Function called to shutdown your python enviroment.
# Return 1 if ok, 0 if something went wrong.
def ices_shutdown():
    print 'Executing shutdown() function...'
    return 1


# Function called to get the next filename to stream.
# Should return a string.
def ices_get_next():
    global silence
    print 'Executing get_next() function...'
    next_song = r.get('next_song')
    r.publish('getNext', 'getNext')
    return next_song if next_song else silence

# This function, if defined, returns the string you'd like used
# as metadata (ie for title streaming) for the current song. You may
# return null to indicate that the file comment should be used.
# def ices_get_metadata():
#    return 'Artist - Title (Label, Year)'


# Function used to put the current line number of
# the playlist in the cue file. If you don't care about this number
# don't use it.
# def ices_get_lineno():
#     global songnumber
#     print 'Executing get_lineno() function...'
#     songnumber = songnumber + 1
#     return songnumber
