"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface LoadingRedirectProps {
  to: string;
  replace?: boolean;
}

export default function LoadingRedirect({ to, replace = true }: LoadingRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Use replace by default to prevent navigation chain issues
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Redirecting...
      </p>
    </div>
  );
}
