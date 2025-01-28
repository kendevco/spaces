# Spaces Module for Payload CMS

The **Spaces Module** enhances Payload CMS with real-time chat, collaboration, and media sharing capabilities. It integrates with Socket.IO for real-time updates and is designed to run seamlessly with Payload CMS and Next.js. This guide provides a detailed overview of the module's architecture, setup, and integration to assist new developers in quickly getting started.

---

## **Features**

- **Real-time messaging**: Powered by Socket.IO for instant updates.
- **Media sharing**: File uploads with Payload CMS's media library.
- **Member management**: Role-based access control (Admin, Moderator, Member, Guest).
- **Channel organization**: Create, manage, and enforce access controls for channels.
- **Profile management**: Extendable user profiles and relationships.
- **Extensibility**: Works seamlessly with other Payload CMS instances.

---

## **Solution Architecture**

```
src/spaces/
├── actions/           # Next.js App Router server actions
├── collections/       # Payload CMS collection configs and types
├── components/        # React components for UI
│   ├── chat/         # Components for chat functionality
│   ├── space/        # Components for managing spaces
│   └── ui/           # Reusable UI components
├── config/           # Constants, role definitions, and shared settings
├── hooks/            # React hooks for state management and Socket.IO
├── modals/           # Dialog components (shadcn/ui-based modals)
├── providers/        # Context providers for global state
├── services/         # Business logic layer for Spaces functionality
└── utilities/        # Helper functions and type guards
```

---

## **Setup**

### **Installation**

1. Install required dependencies:

   ```bash
   npm install payload socket.io @payloadcms/next-payload
   ```

2. Set up environment variables:

   ```env
   PAYLOAD_SECRET=your-secret
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
   ```

3. Add the module to your Payload CMS project:

   - Place the `spaces` module directory in your `src/` folder.
   - Update your `payload.config.ts`:

     ```ts
     import { SpacesCollection, SpacesUtilities } from './spaces'

     const config = {
       collections: [
         ...SpacesCollection, // Add spaces-related collections
       ],
       plugins: [
         SpacesUtilities, // Include Spaces utilities
       ],
       // Add other Payload configurations
     }

     export default config
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## **Usage Examples**

### **Creating a New Space**

```tsx
import { createSpace } from '@/spaces/actions/spaces'

const newSpace = await createSpace({
  name: 'Team Chat',
  imageUrl: '/images/team.jpg',
  user: currentUser,
  initialChannel: 'general',
})
console.log('New Space:', newSpace)
```

### **Sending a Message**

```tsx
import { createMessage } from '@/spaces/actions/messages'

const message = await createMessage({
  content: 'Here is a file!',
  channelId: 'channel-123',
  userId: 'user-456',
  attachment: {
    type: 'image',
    url: '/uploads/image.jpg',
  },
})
console.log('Message Sent:', message)
```

---

## **Module Components**

### **Key UI Components**

- **`SpaceLayout`**: Main layout with sidebar, chat area, and dynamic routing for spaces.
- **`ChatMessages`**: Virtualized message list for real-time updates.
- **`ChatInput`**: Rich text editor with file upload capabilities.
- **`SpaceSidebar`**: Sidebar for member lists, navigation, and channel organization.
- **`MembersModal`**: Manage member roles and invitations in a modal.

### **Reusable UI**

- **`UI Components`**: Found in `spaces/components/ui/`. Includes buttons, tooltips, dropdown menus, and inputs.
- **Dialog Modals**: Use [shadcn/ui](https://ui.shadcn.com/) for sleek, consistent modals.

---

## **Integration Points with Payload CMS**

### **Collections**

The `spaces/collections` directory defines key collections used in the Spaces module:

1. **Spaces**: Manages spaces with metadata (e.g., name, image, and settings).
2. **Channels**: Defines channels within spaces, with access control.
3. **Messages**: Stores chat messages, including attachments.
4. **Members**: Tracks user roles and participation in spaces.

### **Services**

The `spaces/services` directory implements server-side logic:

- **MemberService**: Handle role-based access and member management.
- **MessageService**: Handles creating, updating, and retrieving messages.
- **SpaceService**: Logic for space creation, deletion, and updates.

### **Utilities**

The `spaces/utilities` directory contains helper functions:

- `payloadClient`: Provides pre-configured API clients for seamless database queries.
- `typeGuards`: Ensure runtime type safety.
- `socketPresence`: Manages real-time presence states using Socket.IO.

---

## **Real-Time Messaging**

### **Socket.IO Setup**

Socket.IO is used for real-time communication:

1. **Server-Side Integration**:

   - Add a custom Socket.IO server in `app/api/socket/io.ts`.

   ```ts
   import { Server } from 'socket.io'

   const io = new Server()

   io.on('connection', (socket) => {
     console.log('User connected:', socket.id)

     socket.on('join-room', (room) => {
       socket.join(room)
       io.to(room).emit('user-joined', socket.id)
     })

     socket.on('send-message', (data) => {
       io.to(data.channelId).emit('new-message', data.message)
     })
   })

   export default io
   ```

2. **Client-Side Integration**:

   - Use hooks like `useSocket` to manage client connections:

     ```ts
     import { useEffect } from 'react'
     import io from 'socket.io-client'

     const socket = io(process.env.NEXT_PUBLIC_SERVER_URL)

     const useSocket = () => {
       useEffect(() => {
         socket.on('connect', () => {
           console.log('Connected:', socket.id)
         })

         socket.on('new-message', (message) => {
           console.log('New message:', message)
         })

         return () => socket.disconnect()
       }, [])
     }

     export default useSocket
     ```

---

## **Advanced Features**

### **Jobs Queue**

For long-running tasks or scheduling:

- Use the Payload CMS Jobs Queue (`src/spaces/utilities/jobs`).
- Example: Queue a message sync task.

  ```ts
  import { queueJob } from 'payload'

  queueJob({
    name: 'syncMessages',
    data: { channelId: '123' },
    handler: async ({ channelId }) => {
      console.log('Syncing messages for channel:', channelId)
      // Your logic here
    },
  })
  ```

---

## **Extending the Module**

To customize or extend:

1. **Add New Collections**: Place them in `spaces/collections/` and register in `payload.config.ts`.
2. **Customize Hooks**: Create reusable hooks in `spaces/hooks/` for common tasks.
3. **Integrate APIs**: Extend `spaces/actions/` for custom API endpoints.

---

## **Best Practices**

1. **Organize Code**: Keep components modular and group by functionality.
2. **Use TypeScript**: Strongly type collections, hooks, and services for better maintainability.
3. **Follow Payload Conventions**: Adhere to Payload CMS best practices for configuration and extensions.

---

## **Contributing**

1. Fork the repository and create a new branch.
2. Implement your changes and add tests.
3. Submit a pull request.

---

## **Resources**

- **Payload CMS Documentation**: [https://payloadcms.com/docs](https://payloadcms.com/docs)
- **Socket.IO Documentation**: [https://socket.io/docs/](https://socket.io/docs/)
- **Join the Community**: [Payload Discord](https://discord.gg/payloadcms)

---

## **License**

This module is open-source and licensed under the MIT License. Contributions are welcome!
