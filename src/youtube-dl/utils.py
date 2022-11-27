# coding: utf-8

from unicodedata import normalize as u_normalize
from re import sub as re_sub
from sys import stderr

def slugify(value, allow_unicode=False):
    value = str(value)
    if allow_unicode:
        value = u_normalize('NFKC', value)
    else:
        value = u_normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')

    return re_sub(r'[^,\w\s-]', '', value)
   
def log(*args, **kwargs):
    print(*args, file=stderr, **kwargs)