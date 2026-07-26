from flask import Flask
from flask_cors import CORS, cross_origin
import numpy as np
import pandas as pd

colorsdb = pd.read_csv("colordb.csv")
colordb_rgb = colorsdb[["r", "g", "b"]].to_numpy(dtype=np.float64)

def hex_to_rgb(hexcode: str) -> tuple:
    rs, gs, bs = hexcode[0:2], hexcode[2:4], hexcode[4:]
    r, g, b = int(rs, 16), int(gs, 16), int(bs, 16)

    return (r, g, b)


def rgb_to_hex(rgb: tuple) -> str:
    return f"#{int(rgb[0]):02x}{int(rgb[1]):02x}{int(rgb[2]):02x}"


def calculate_match(trgb):
    target = np.asarray(trgb[:3], dtype=np.float64)
    dists = np.linalg.norm(colordb_rgb - target, axis=1)
    return colorsdb.iloc[np.argmin(dists)].color_name
