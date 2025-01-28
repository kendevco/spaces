// path: src/components/Spaces/navigation/navigation-item.tsx
"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/utilities/cn";
import { ActionTooltip } from "@/spaces/components/action-tooltip";
import { cookies } from 'next/headers';

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export function NavigationItem({ id, name, imageUrl }: NavigationItemProps) {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/spaces/${id}`);
  };


  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={onClick}
        className={cn(
          "group relative flex items-center",
          "h-12 w-12 mx-3 rounded-[24px]",
          "transition-all overflow-hidden",
          "bg-background dark:bg-neutral-700 hover:bg-emerald-500 dark:hover:bg-emerald-700",
          "hover:rounded-[16px]",
          params?.spaceId === id && "bg-emerald-500 dark:bg-emerald-700 rounded-[16px]"
        )}
      >
        <div className="relative flex mx-auto">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              height={48}
              width={48}
              className="object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center bg-primary/10 font-semibold text-primary">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </button>
    </ActionTooltip>
  );
}
