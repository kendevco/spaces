"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useModal } from "@/spaces/hooks/use-modal-store";
import { track } from '@vercel/analytics';
import { toast } from '@payloadcms/ui';
import { addMember } from '@/spaces/actions/members';
import { MemberRole } from '@/spaces/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ModalData {
  spaceId: string;
}

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
});

export const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "members";
  const { spaceId } = data as unknown as ModalData;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await addMember({
        spaceId,
        userId: values.email,
        role: MemberRole.MEMBER,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      form.reset();
      router.refresh();
      onClose();
      toast.success('Member added successfully!');
      track('Member Added', { spaceId });
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    }
  }

  const handleClose = () => {
    track('Members Modal Closed');
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden mx-4">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Invite members to your space by email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-4">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter member's email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="default">
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
