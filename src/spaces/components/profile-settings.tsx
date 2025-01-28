'use client';

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { track } from '@vercel/analytics';
import { toast } from '@payloadcms/ui';
import { MediaCategory } from '@/spaces/types';
import { updateProfile } from '@/spaces/actions/profiles';

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
import { FileUpload } from "@/spaces/components/file-upload";
import { useEffect } from "react";

interface ProfileSettingsProps {
  profileId: string;
  initialData: {
    name: string;
    imageUrl: string;
  };
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required."
  }),
  imageUrl: z.string().min(1, {
    message: "Profile image is required."
  })
});

export const ProfileSettings = ({ profileId, initialData }: ProfileSettingsProps) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  useEffect(() => {
    if (initialData) {
      form.setValue("name", initialData.name);
      form.setValue("imageUrl", initialData.imageUrl);
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await updateProfile(profileId, {
        name: values.name,
        imageUrl: values.imageUrl,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      router.refresh();
      toast.success('Profile updated successfully!');
      track('Profile Updated', { profileId });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          <div className="flex items-center justify-center">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      category={MediaCategory.PROFILE}
                      endpoint={MediaCategory.PROFILE}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  placeholder="Enter your name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} variant="default">
          Save
        </Button>
      </form>
    </Form>
  );
}
