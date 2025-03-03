'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JoinSpaceButtonProps {
  spaceId: string;
  userId: string;
}

export function JoinSpaceButton({ spaceId, userId }: JoinSpaceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    try {
      setIsLoading(true);

      // Create a new member for this user
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join space');
      }

      // Refresh the page to reflect membership
      router.refresh();
    } catch (error) {
      console.error('Error joining space:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={isLoading}
      className="w-full bg-[#7364c0] hover:bg-[#5a4fa0] text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        'Join Space'
      )}
    </Button>
  );
}
