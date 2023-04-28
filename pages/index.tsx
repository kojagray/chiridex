import Head from "next/head";
import { useState } from "react";

import classes from "../styles/wrappers.module.css";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ColorizeIcon from "@mui/icons-material/Colorize";

export default function Home() {
  const [color, setColor] = useState("");
  const [rgb, setRgb] = useState("");
  const [userImage, setUserImage] = useState("");

  async function fetchColorHandler(hex) {
    const response = await fetch(`http://127.0.0.1:5000/color/${hex}`);
    const data = await response.json();
    const retrievedColor = data.color_name;
    const retrievedRgb = data.rgb;
    setColor(retrievedColor);
    setRgb(retrievedRgb);
    console.log(retrievedRgb);
  }

  const colorPickerHandler = () => {
    const colorResult = document.getElementById("colorResult");
    const hexResult = document.getElementById("hexResult");

    const eyeDropper = new EyeDropper();

    eyeDropper
      .open()
      .then((result) => {
        const trimmedHex = result.sRGBHex.substring(1);
        fetchColorHandler(trimmedHex);
        hexResult.textContent = `HEX: ${result.sRGBHex}`;
        colorResult.style.backgroundColor = result.sRGBHex;
      })
      .catch((e) => {
        colorResult.textContent = e;
      });
  };

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      setUserImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
    <>
      <Head>
        <title>The Handiest Color Picker</title>
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
            <div className={`${classes.primaryContainer} ${classes.green}`}>
              <ColorizeIcon id="colorPicker" onClick={colorPickerHandler} />
            </div>
          </nav>
          <div className={classes.imageWrapper}>
            {!!userImage ? (
              <img
                alt="An image for color picking"
                className={classes.targetImage}
                id="targetImage"
                src={userImage}
                style={{ objectFit: "contain" }}
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
        </div>

        <div className="tower padded roundedTile secondary">
          <h1 className={classes.marginBottom}>
            {color
              ? `The color you chose is called "${color}"`
              : "Use the color picker to find the name of your color!"}
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
    </>
  );
}
