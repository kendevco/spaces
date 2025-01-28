// path: src/components/Spaces/Space/space-search.tsx
"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SpaceSearchProps {
  data: {
    label: string;
    type: 'channel' | 'member';
    data:
    | {
      icon: React.ReactNode;
      name: string;
      id: string;
    }[]
    | undefined;
  }[];
}

export const SpaceSearch = ({ data }: SpaceSearchProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  const onClick = ({ id, type }: { id: string; type: 'channel' | 'member' }) => {
    setOpen(false);
    if (type === 'member') {
      router.push(`/spaces/${params?.spaceId}/conversations/${id}`);
    }
    if (type === 'channel') {
      router.push(`/spaces/${params?.spaceId}/channels/${id}`);
    }
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="w-4 h-4 dark:text-zinc-400 text-zinc-500" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">CTRL+S</span>
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle>Search Channels and Members</DialogTitle>
        </VisuallyHidden>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          {data.map(({ label, data, type }) => {
            if (!data?.length) return null;
            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({ id, icon, name }) => {
                  return (
                    <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
