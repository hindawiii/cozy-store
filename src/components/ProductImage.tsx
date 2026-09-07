import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  emoji,
  alt,
  className,
}: {
  src?: string | null;
  emoji?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return <span aria-hidden>{emoji ?? "📦"}</span>;
}
