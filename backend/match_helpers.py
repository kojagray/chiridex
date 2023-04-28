import math 
from match_helpers import *

from flask import Flask
from flask_cors import CORS, cross_origin
import pandas as pd 

colorsdb = pd.read_csv("colordb.csv")

def hex_to_rgb(hexcode):
    rs, gs, bs = hexcode[0:2], hexcode[2:4], hexcode[4:]
    r, g, b = int(rs, 16), int(gs, 16), int(bs, 16)

    return (r, g, b)


def _calculate_match(trgb):
    cdists = []
    for cidx, crow in colorsdb.iterrows():
        dbrgb = (crow.r, crow.g, crow.b)
        cdist = _euclidean_distance(trgb, dbrgb)
        cdists.append(cdist)    
    colorsdb['cdists'] = cdists

    cdb_sorted = colorsdb.sort_values('cdists', ascending=True)
    color_name = cdb_sorted.iloc[0].color_name
    
    return color_name


def _euclidean_distance(dbrgb, trgb):
    dbx, dby, dbz = dbrgb
    tx, ty, tz = trgb

    o0 = (dbx - tx)**2 
    o1 = (dby - ty)**2
    o2 = (dbz - tz)**2

    return math.sqrt(o0 + o1 + o2)