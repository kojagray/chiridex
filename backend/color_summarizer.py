import itertools
import numpy as np 
import os 
from PIL import Image
from pprint import pprint
from sklearn.cluster import KMeans

from match_helpers import _calculate_match

def colored_square(r, g, b):
    cblock = f"\033[48:2::{int(r)}:{int(g)}:{int(b)}m \033[49m"
    csquare = ""
    for _ in range(5):
        csquare += (cblock*10) + "\n"
    return csquare

if __name__=="__main__":
    test_image_path = "../public/42069069_715870422081244_3220977222890291200_n.jpg"
    test_image = Image.open(test_image_path)
    test_image = test_image.resize((256,256))
    image_matrix = np.array(test_image)
    color_array = image_matrix.reshape((-1, image_matrix.shape[-1]))

    k_means = KMeans(n_clusters=10).fit(color_array)
    labeled_color_array = np.column_stack([color_array, k_means.labels_])

    for label in set(k_means.labels_):
        mask = labeled_color_array[:,-1] == label
        mask_colors = labeled_color_array[mask][:, :-1].mean(0)
        avg_color = tuple(mask_colors)

        match_name = _calculate_match(avg_color)
        print(match_name)

        r, g, b = avg_color
        print(colored_square(r, g, b))