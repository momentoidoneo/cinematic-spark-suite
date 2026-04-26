type TransformOptions = {
  width: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

const STORAGE_PUBLIC_PATH = "/storage/v1/object/public/";
const STORAGE_RENDER_PATH = "/storage/v1/render/image/public/";

export const getOptimizedImageUrl = (src: string, options: TransformOptions) => {
  if (!src.includes(STORAGE_PUBLIC_PATH)) return src;

  try {
    const url = new URL(src);
    url.pathname = url.pathname.replace(STORAGE_PUBLIC_PATH, STORAGE_RENDER_PATH);
    url.searchParams.set("width", String(options.width));
    if (options.height) url.searchParams.set("height", String(options.height));
    url.searchParams.set("quality", String(options.quality ?? 72));
    url.searchParams.set("resize", options.resize ?? "cover");
    return url.toString();
  } catch {
    return src;
  }
};

export const getOptimizedImageSrcSet = (src: string, widths: number[], options?: Omit<TransformOptions, "width">) => {
  if (!src.includes(STORAGE_PUBLIC_PATH)) return undefined;

  return widths
    .map((width) => `${getOptimizedImageUrl(src, { ...options, width })} ${width}w`)
    .join(", ");
};
