import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ColorizeIcon from "@mui/icons-material/Colorize";

export default function Home() {
  const [color, setColor] = useState("");
  const [userImage, setUserImage] = useState(
    "/../public/monkey-head-nebula.jpg"
  );

  async function fetchColorHandler(r, g, b) {
    const response = await fetch(`http://127.0.0.1:5000/color/${r}/${g}/${b}`);
    const data = await response.json();
    const retrievedColor = data.color_name;
    setColor(retrievedColor);
  }

  const colorPickerHandler = () => {
    const resultElement = document.getElementById("result");

    const hexToRgb = (hex) => {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5), 16);
      fetchColorHandler(r, g, b);
    };

    const eyeDropper = new EyeDropper();

    eyeDropper
      .open()
      .then((result) => {
        resultElement.textContent = result.sRGBHex;
        resultElement.style.backgroundColor = result.sRGBHex;
        hexToRgb(result.sRGBHex);
        console.log(result.sRGBHex);
      })
      .catch((e) => {
        resultElement.textContent = e;
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
          content="Tool for getting color values from images"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="centered">
        <div className="tower padded roundedTile">
          <nav className="imageControls">
            <label className="imageInput blue" htmlFor="imageInput">
              <AddPhotoAlternateIcon />

              <input
                hidden
                id="imageInput"
                onChange={onImageChange}
                type="file"
              />
            </label>
            <div className="buttonWrapper green">
              <ColorizeIcon id="colorPicker" onClick={colorPickerHandler} />
            </div>
          </nav>
          <div className="imageContainer">
            <Image
              alt="An image for color picking"
              id="targetImage"
              src={userImage}
              fill
            />
          </div>
        </div>

        <div className="tower padded">
          <h1>
            {color
              ? color
              : "Use the color picker to find the name of your color!"}
          </h1>
          <span id="result" />
        </div>
      </div>
    </>
  );
}
