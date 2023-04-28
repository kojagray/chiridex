import math 
from match_helpers import *

from flask import Flask
from flask_cors import CORS, cross_origin
import pandas as pd 

colorsdb = pd.read_csv("colordb.csv")

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/image")
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def return_image_from_frontend():
    pass 


@app.route("/color/<hexcode>")
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def calculate_match(hexcode):
    target_rgb = hex_to_rgb(hexcode)
    color_name = _calculate_match(target_rgb)
    return {
        "color_name" : color_name,
        "hexcode" : hexcode,
        "rgb": list(target_rgb)
    }




