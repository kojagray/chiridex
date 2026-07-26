import Head from "next/head";
import { useState } from "react";

import classes from "../styles/wrappers.module.css";
import { useColorPicker } from "../hooks/useColorPicker";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

export default function Home() {
  const [color, setColor] = useState("");
  const [rgb, setRgb] = useState("");
  const [userImage, setUserImage] = useState("");
  const [palette, setPalette] = useState([]);

  async function fetchColorHandler(hex) {
    const response = await fetch(`http://127.0.0.1:5000/color/${hex}`);
    const data = await response.json();
    const retrievedColor = data.color_name;
    const retrievedRgb = data.rgb;
    setColor(retrievedColor);
    setRgb(retrievedRgb);
    console.log(retrievedRgb);
  }

  const { canvasRef, handleImageLoad, handleImageClick } = useColorPicker(
    (hex) => {
      fetchColorHandler(hex.substring(1));

      const hexResult = document.getElementById("hexResult");
      const colorResult = document.getElementById("colorResult");
      if (hexResult) hexResult.textContent = `HEX: ${hex}`;
      if (colorResult) colorResult.style.backgroundColor = hex;
    }
  );

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUserImage(URL.createObjectURL(file));
      sendImageToBackend(file)
    }
  };

  async function sendImageToBackend(file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("http://127.0.0.1:5000/color/generate_palette", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setPalette(data['palette'])
  }

  return (
    <>
      <Head>
        <title>chiridex</title>
        <meta
          name="description"
          content="A tool that assists artists in creating custom color palettes from random selection, image input, mood descriptions, and suggestions based on different perspectives on color harmony."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="centered">
        <div className="tower padded roundedTile primary">
          <nav className={classes.imageControlWrapper}>
            <label
              className={`${classes.primaryContainer} ${classes.blue}`}
              htmlFor="imageInput"
            >
              <AddPhotoAlternateIcon />
              <input
                hidden
                id="imageInput"
                onChange={onImageChange}
                type="file"
              />
            </label>
          </nav>
          <div className={classes.imageWrapper}>
            {!!userImage ? (
              <img
                alt="An image for color picking"
                className={classes.targetImage}
                id="targetImage"
                src={userImage}
                style={{ objectFit: "contain" }}
                onLoad={handleImageLoad}
                onClick={handleImageClick}
              />
            ) : (
              <div className={classes.imagePlaceholder}>
                Please upload an image
                <label
                  className={`${classes.placeholderButton}`}
                  htmlFor="imageInput"
                >
                  <input
                    hidden
                    id="imageInput"
                    onChange={onImageChange}
                    type="file"
                  />
                </label>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <div className="tower padded roundedTile secondary">
          <h1 className={classes.marginBottom}>
            {color
              ? `${color}`
             : ""}
          </h1>
          <h3 id="hexResult" className={classes.marginBottom} />
          {rgb && (
            <h3 className={classes.marginBottom}>
              RGB({rgb[0]},{rgb[1]},{rgb[2]})
            </h3>
          )}
          <span id="colorResult" className={classes.colorResult} />
        </div>
      </div>

      <div className={classes.primaryContainer}>
        <div className={classes.paletteWrapper}>
          {palette && palette.map((swatch, index) => (
              <div key={index}>
                <div 
                className={classes.paletteSwatch} 
                style={{ backgroundColor: swatch.hexcode }} >
                </div>
              <p>{swatch.color_name}</p>
              <p>{swatch.hexcode}</p>
              </div>
          ))
          }
        </div>
      </div>
    </>
  );
}
