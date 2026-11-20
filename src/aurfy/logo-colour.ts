/**
 * Approximate a logo's brand colour: the average of its saturated, non-white,
 * non-transparent pixels. Returns null when the logo is monochrome or can't be read.
 */
export async function logoAccentHex(dataUrl: string | null | undefined): Promise<string | null> {
  if (!dataUrl || typeof document === "undefined") return null;
  try {
    const image = new Image();
    image.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("logo"));
      image.src = dataUrl;
    });
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, size, size);
    const { data } = context.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [pr, pg, pb, pa] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (pa < 128) continue;
      const max = Math.max(pr, pg, pb);
      const min = Math.min(pr, pg, pb);
      if (max - min < 40) continue; // greys, black and white say nothing about the brand
      r += pr;
      g += pg;
      b += pb;
      count += 1;
    }
    if (count < 20) return null;
    const hex = (value: number) => Math.round(value / count).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  } catch {
    return null;
  }
}
