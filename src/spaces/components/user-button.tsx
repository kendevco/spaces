"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SafeUser } from "@/spaces/types/user";

interface UserButtonProps {
  user: SafeUser | null;
}

export function UserButton({ user }: UserButtonProps) {
  if (!user) return null;

  return (
    <Avatar className="h-[48px] w-[48px] md:h-10 md:w-10">
      <AvatarImage src={user.imageUrl || ""} />
      <AvatarFallback>
        {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
