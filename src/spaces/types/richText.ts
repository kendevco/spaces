// Rich text node types for Payload CMS
export interface TextNode {
  [key: string]: unknown;
  type: 'text';
  text: string;
  version: number;
}

export interface ParagraphNode {
  [key: string]: unknown;
  type: 'paragraph';
  children: TextNode[];
  version: number;
}

export interface RootNode {
  [key: string]: unknown;
  type: 'root';
  children: ParagraphNode[];
  direction: 'ltr' | 'rtl' | null;
  format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify';
  indent: number;
  version: number;
}

export interface RichTextContent {
  root: RootNode;
} 