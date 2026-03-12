import Image from "next/image";

interface UnsplashImageProps {
  src: string;
  alt: string;
  credit?: { name: string; link: string };
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function UnsplashImage({
  src,
  alt,
  credit,
  fill,
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: UnsplashImageProps) {
  return (
    <figure className="relative">
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${className ?? ""}`}
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 500}
          className={`object-cover ${className ?? ""}`}
          sizes={sizes}
          priority={priority}
        />
      )}
      {credit && (
        <figcaption className="absolute bottom-1 right-2 text-[10px] text-white/70">
          Photo by{" "}
          <a
            href={credit.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {credit.name}
          </a>{" "}
          / Unsplash
        </figcaption>
      )}
    </figure>
  );
}
