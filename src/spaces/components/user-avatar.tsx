import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utilities/cn";

interface UserAvatarProps {
  src?: string | null;
  className?: string;
  fallback?: string;
};

export const UserAvatar = ({
  src,
  className,
  fallback = "?"
}: UserAvatarProps) => {
  // Check if NEXT_PUBLIC_SITE_URL or Vercel URL is available
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || '';

  // Check if the src is a system user image
  if (src && src === process.env.SYSTEM_USER_IMAGE) {
    const fullSrc = src.startsWith('http') ? src : `${baseUrl}${src}`;
    return (
      <Avatar className={cn(
        "h-7 w-7 md:h-10 md:w-10",
        className
      )}>
        <AvatarImage src={fullSrc} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={cn(
      "h-7 w-7 md:h-10 md:w-10",
      className
    )}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};
