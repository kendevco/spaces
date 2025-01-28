'use client';

import axios from "axios";
import qs from "query-string";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { track } from '@vercel/analytics';
import { useState, useCallback } from "react";
import { toast } from '@/spaces/utilities/toast';
import { MediaCategory } from "@/spaces/types";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { useModal } from "@/spaces/hooks/use-modal-store";
import { UploadDropzone } from '@/spaces/components/upload-dropzone'

const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "Attachment is required."
    }),
    content: z.string().optional()
});

export const MessageFileModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type === "messageFile";
    const { apiUrl, query } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: "",
            content: ""
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = useCallback(() => {
        track('Message File Modal Closed');
        form.reset();
        onClose();
    }, [form, onClose]);

    const onUpload = async (urls: string[]) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channelId: data.channelId,
                    attachments: urls.map(url => ({
                        relationTo: 'spaces-media',
                        value: url
                    }))
                }),
            })

            if (!response.ok) throw new Error('Upload failed')
            router.refresh();
            onClose();
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error('MESSAGE_FILE_UPLOAD_ERROR:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white p-0 overflow-hidden">
                <UploadDropzone
                    endpoint="messageAttachment"
                    onUploadComplete={onUpload}
                    config={{
                        multiple: true,
                        maxFiles: 5,
                        category: MediaCategory.MESSAGE
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
