// path: src/components/Spaces/chat/chat-item.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import { ExtendedMember, MemberRole } from "@/spaces/types";
import { cn } from "@/utilities/cn";

import { UserAvatar } from "@/spaces/components/user-avatar";
import { ActionTooltip } from "@/spaces/components/action-tooltip";
import { useModal } from "@/spaces/hooks/use-modal-store";

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MEMBER]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
};

interface ChatItemProps {
  id: string;
  content: string | { root: { children: Array<{ text?: string }> } };
  member: ExtendedMember;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: ExtendedMember;
  isUpdated: boolean;
  isLast?: boolean;
}

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  isLast,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const router = useRouter();
  const params = useParams();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/spaces/${params?.spaceId}/conversations/${member.id}`);
  };

  const memberName = member?.profile?.name || "Unknown User";
  const memberImageUrl = member?.profile?.imageUrl || null;
  const memberInitial = memberName?.[0] || "?";

  const messageContent = (() => {
    if (typeof content === 'string') {
      return content;
    }

    if (content?.root?.children) {
      return content.root.children
        .map(child => child.text || '')
        .join('');
    }

    return '';
  })();

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar
            src={memberImageUrl}
            className="h-8 w-8 md:h-8 md:w-8"
            fallback={memberInitial}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">
                {memberName}
              </p>
              <ActionTooltip label={member?.role || 'member'}>
                {roleIconMap[member?.role as MemberRole || MemberRole.MEMBER]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {deleted ? (
            <div className="mt-2">
              <p className="text-sm italic text-zinc-500">
                This message has been deleted
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <p className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                "break-words whitespace-pre-wrap"
              )}>
                {messageContent || 'No content available'}
                {isUpdated && !isEditing && (
                  <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 mt-2 text-blue-500 hover:underline"
                >
                  <FileIcon className="h-4 w-4" />
                  Attachment
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
