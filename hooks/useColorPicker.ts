import { useRef } from "react";

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function useColorPicker(onPick: (hex: string) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = (event: any) => {
    const img = event.target;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
  };

  const handleImageClick = (event: any) => {
    const img = event.target;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = img.getBoundingClientRect();
    const scale = Math.min(
      rect.width / img.naturalWidth,
      rect.height / img.naturalHeight
    );
    const renderedWidth = img.naturalWidth * scale;
    const renderedHeight = img.naturalHeight * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    const imgX = (event.clientX - rect.left - offsetX) / scale;
    const imgY = (event.clientY - rect.top - offsetY) / scale;

    if (imgX < 0 || imgY < 0 || imgX >= img.naturalWidth || imgY >= img.naturalHeight) {
      return;
    }

    const pixel = canvas
      .getContext("2d")
      ?.getImageData(Math.floor(imgX), Math.floor(imgY), 1, 1).data;
    if (!pixel) return;

    onPick(rgbToHex(pixel[0], pixel[1], pixel[2]));
  };

  return { canvasRef, handleImageLoad, handleImageClick };
}
