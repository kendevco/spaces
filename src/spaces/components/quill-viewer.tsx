'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.bubble.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

interface QuillViewerProps {
  content: string;
}

export const QuillViewer = ({ content }: QuillViewerProps) => {
  return (
    <ReactQuill
      value={content}
      readOnly={true}
      theme="bubble"
      modules={{ toolbar: false }}
    />
  );
};
