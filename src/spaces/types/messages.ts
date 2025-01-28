export type MessageContent = {
  [key: string]: unknown;
  root: {
    type: string;
    children: Array<{
      [key: string]: unknown;
      type: string;
      children: Array<{
        text: string;
        version: number;
        [key: string]: unknown;
      }>;
      version: number;
    }>;
    direction: 'ltr' | 'rtl' | null;
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify';
    indent: number;
    version: number;
  };
}

export interface MessageAttachment {
  file: string;
}

export interface BaseMessage {
  content: MessageContent;
  attachments?: MessageAttachment[];
} 