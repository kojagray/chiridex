import math 

from match_helpers import *
from PIL import Image
from sklearn.cluster import KMeans
from flask import Flask, request
from flask_cors import CORS, cross_origin
import pandas as pd 
import numpy as np

colorsdb = pd.read_csv("colordb.csv")

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/color/generate_palette", methods=["POST"])
@cross_origin(origin='*', methods=["POST"], headers=['Content-Type','Authorization'])
def generate_palette_endpoint():
    image_data = request.files["image"] 
    image = Image.open(image_data)
    image_mtx = np.array(image.resize((256,256)))
    color_array = image_mtx.reshape((-1, image_mtx.shape[-1]))

    km = KMeans(n_clusters=8).fit(color_array) #TODO variable palette size 
    km_labeled = np.column_stack([color_array, km.labels_])

    palette = []
    for label in set(km.labels_):
        mask = km_labeled[:, -1] == label 
        mask_colors = km_labeled[mask][:, :-1].mean(0)
        avg_color = tuple(mask_colors[:-1])
        hexcode = rgb_to_hex(avg_color)

        match_name = calculate_match(avg_color)
        palette.append({
            "color_name" : match_name, 
            "hexcode" : hexcode 
        })

    return {
        "palette" : palette
    }

@app.route("/color/<hexcode>")
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def calculate_match_endpoint(hexcode):
    target_rgb = hex_to_rgb(hexcode)
    color_name = calculate_match(target_rgb)
    return {
        "color_name" : color_name,
        "hexcode" : hexcode,
        "rgb": list(target_rgb)
    }

