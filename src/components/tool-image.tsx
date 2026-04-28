"use client";

import { useState } from "react";

type ToolImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

const FALLBACK_IMAGE_SRC = "/error.png";

export function ToolImage({
  src,
  alt,
  className,
  loading = "lazy",
}: ToolImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE_SRC) {
          setCurrentSrc(FALLBACK_IMAGE_SRC);
        }
      }}
    />
  );
}
