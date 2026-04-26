import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import { sanitizeExternalUrl } from "@/lib/security";
import { cn } from "@/lib/utils";

interface ContentImageProps {
  src?: string | null;
  alt: string;
  tone?: string;
  icon?: LucideIcon;
  className?: string;
  labelClassName?: string;
}

const fallbackTone = "from-primary/60 to-primary/25";

export default function ContentImage({
  src,
  alt,
  tone = fallbackTone,
  icon: Icon = ImageIcon,
  className,
  labelClassName,
}: ContentImageProps) {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const safeSrc = useMemo(() => (failedToLoad ? null : sanitizeExternalUrl(src)), [failedToLoad, src]);

  if (safeSrc) {
    return (
      <img
        src={safeSrc}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        decoding="async"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedToLoad(true)}
      />
    );
  }

  return (
    <div className={cn("bg-gradient-to-br flex items-center justify-center relative overflow-hidden", tone, className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <Icon className="w-9 h-9 text-foreground/30" />
        <span className={cn("font-body text-xs font-medium text-foreground/55", labelClassName)}>{alt}</span>
      </div>
    </div>
  );
}
