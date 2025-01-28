import type { Message } from '@/spaces/collections/types'

export function createSystemMessage(content: string): Partial<Message> {
  return {
    content: {
      root: {
        type: 'root',
        children: [{
          type: 'paragraph',
          children: [{ 
            text: content,
            version: 1
          }],
          version: 1
        }],
        direction: null,
        format: '',
        indent: 0,
        version: 1
      }
    },
    // Other message fields will be filled by Payload
  }
}
