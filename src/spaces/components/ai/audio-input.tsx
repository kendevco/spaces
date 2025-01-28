"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from '@payloadcms/ui'
import { Mic, Loader2 } from "lucide-react"

interface AudioInputProps {
  onTranscriptionComplete: (transcription: string) => void;
  disabled?: boolean;
  textInputRef: React.RefObject<HTMLTextAreaElement | HTMLDivElement>;
}

export default function AudioInput({
  onTranscriptionComplete,
  disabled = false,
  textInputRef
}: AudioInputProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')

      const response = await fetch('/api/transcribe-whisper', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let transcription = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line) {
              try {
                const data = JSON.parse(line)
                if (data.progress) {
                  setProgress(data.progress)
                }
                if (data.transcription) {
                  transcription = data.transcription
                }
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (error) {
                console.error('Error parsing JSON:', error)
              }
            }
          }
        }
      }

      onTranscriptionComplete(transcription);
    } catch (error) {
      console.error('Error during transcription:', error)
      toast.error(error instanceof Error ? error.message : "An error occurred during transcription. Please try again.")
    } finally {
      setIsTranscribing(false)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          handleTranscribe(audioBlob);
        };

        chunksRef.current = []; // Clear any previous chunks
        mediaRecorderRef.current.start();
        setIsRecording(true);

        // Disable the text input when recording starts
        if (textInputRef.current) {
          (textInputRef.current as HTMLTextAreaElement | HTMLDivElement).setAttribute('disabled', 'true');
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error("Unable to access the microphone. Please check your permissions.")
      }
    }
  };

  useEffect(() => {
    // Re-enable the text input when recording or transcribing ends
    if (!isRecording && !isTranscribing && textInputRef.current) {
      (textInputRef.current as HTMLTextAreaElement | HTMLDivElement).removeAttribute('disabled');
    }
  }, [isRecording, isTranscribing, textInputRef]);

  return (
    <>
      <Button
        type="button"
        onClick={toggleRecording}
        variant={isRecording ? "destructive" : "secondary"}
        className={`bg-gray-700 hover:bg-gray-600 border-gray-600 transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
        disabled={isTranscribing || disabled}
      >
        {isRecording ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      {(isRecording || isTranscribing) && (
        <Progress value={isRecording ? 100 : progress} className="w-full mt-2" />
      )}
    </>
  )
}
