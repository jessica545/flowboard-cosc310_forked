# Basic Chat Feature Implementation Guide

## Overview

This guide provides a function-by-function approach to implementing basic chat functionality in the Flowboard application. Each function is implemented and tested independently to ensure 100% functionality before moving to the next.

### Current Implementation Status
- **v0.1.0**: Basic Layout (Completed)
  - Chat container with flex layout
  - Message list placeholder
  - Message input placeholder
  - Client-side component setup
  - Route handling with middleware

### Required Setup
1. **Middleware Configuration**
   - File: `src/middleware.ts`
   - Purpose: Handle workspace route rewrites
   - Pattern: `/workspaces/:workspaceId/*` → `/:workspaceId/*`

2. **Component Structure**
   ```
   src/features/chat/
   ├── components/               # UI Components
   │   ├── chat-container.tsx   # Main layout wrapper (completed)
   │   ├── message-list.tsx     # Message display area (placeholder)
   │   ├── message-input.tsx    # Input component (placeholder)
   │   └── __tests__/          # Component tests
   ```

3. **Route Structure**
   ```
   src/app/
   └── (dashboard)/
       └── [workspaceId]/
           └── chat/
               └── page.tsx     # Chat page component
   ```

### Versioning Strategy
Each function gets its own version number and must pass all tests before proceeding:

- **v0.1.0**: Chat Container Layout 
  - Basic component structure
  - Route handling
  - Layout placeholders
  - Client component setup

- **v0.2.0**: Message Input Component (Next)
  - Form implementation
  - Input validation
  - Submit handling
  - Loading states

- **v0.3.0**: Message Bubble Component
  - Message display
  - User attribution
  - Timestamps
  - Layout variants

- **v0.4.0**: Message Sending API
  - API endpoints
  - Error handling
  - Optimistic updates
  - Rate limiting

- **v0.5.0**: Message Fetching API
  - Query implementation
  - Pagination
  - Real-time updates setup
  - Error states

- **v0.6.0**: Real-time Updates
  - WebSocket connection
  - Message syncing
  - Presence indicators
  - Typing indicators

### Testing Requirements

#### Unit Tests
1. **Component Tests**
   ```typescript
   // src/features/chat/components/__tests__/chat-container.test.tsx
   describe('ChatContainer', () => {
     it('renders with correct layout structure', () => {
       render(<ChatContainer />);
       expect(screen.getByTestId('message-list')).toBeInTheDocument();
       expect(screen.getByTestId('message-input')).toBeInTheDocument();
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Container fills available height
   - [ ] Message list area scrolls
   - [ ] Input area stays fixed at bottom
   - [ ] Responsive on all screen sizes:
     - Mobile (320px)
     - Tablet (768px)
     - Desktop (1024px)
   - [ ] No horizontal scrollbars

### Next Steps (v0.2.0)
1. Implement message input form
2. Add input validation
3. Create submit handler
4. Add loading states
5. Update tests

### Member Integration Requirements
- Chat feature must integrate with existing member system
- Messages are associated with workspace members
- Real-time updates respect member permissions
- Member avatars and names displayed in messages
- Member status (online/offline) shown in chat

### Key Features
- Basic real-time messaging
- Simple group chat
- Member integration
- Mobile responsiveness

### Technology Stack
- Frontend: Next.js with TypeScript
- UI: Tailwind CSS
- Backend: Appwrite
- Real-time: Appwrite Realtime
- State Management: React Query

## Directory Structure

```
src/
├── features/
│   └── chat/                      # Main chat feature directory
│       ├── api/                   # API integration layer
│       │   ├── use-send-message.ts    # Hook for sending messages
│       │   └── use-get-messages.ts    # Hook for fetching messages
│       ├── components/            # UI components
│       │   ├── chat-container.tsx     # Main chat layout wrapper
│       │   └── message-bubble.tsx     # Individual message display
│       ├── server/                # Server-side handlers
│       │   └── route.ts               # API route handlers
│       └── types.ts               # TypeScript type definitions
└── app/
    └── (dashboard)/              # Dashboard layout group
        └── [workspaceId]/        # Dynamic workspace route
            └── chat/            # Chat page
                └── page.tsx     # Chat page component
```

## Function-by-Function Implementation

### v0.1.0: Chat Container Layout
**Files to Create/Modify:**
- `/src/app/(dashboard)/[workspaceId]/chat/page.tsx` (Create)
- `/src/features/chat/components/chat-container.tsx` (Create)
- `/src/features/chat/components/message-list.tsx` (Create)
- `/src/features/chat/types.ts` (Create)

```typescript
// src/app/(dashboard)/[workspaceId]/chat/page.tsx
export default function ChatPage() {
  return (
    <div className="flex h-full">
      <ChatContainer />
    </div>
  );
}

// src/features/chat/components/chat-container.tsx
export function ChatContainer() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>
      <MessageInput />
    </div>
  );
}
```

**Appwrite Setup:**
- No Appwrite configuration needed for this version

#### Test Strategy v0.1.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/components/__tests__/chat-container.test.tsx
   describe('ChatContainer', () => {
     it('renders with correct layout structure', () => {
       render(<ChatContainer />);
       expect(screen.getByTestId('message-list')).toBeInTheDocument();
       expect(screen.getByTestId('message-input')).toBeInTheDocument();
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Container fills available height
   - [ ] Message list area scrolls
   - [ ] Input area stays fixed at bottom
   - [ ] Responsive on all screen sizes:
     - Mobile (320px)
     - Tablet (768px)
     - Desktop (1024px)
   - [ ] No horizontal scrollbars

### v0.2.0: Message Input Component
**Files to Create/Modify:**
- `/src/features/chat/components/message-input.tsx` (Create)
- `/src/features/chat/hooks/use-send-message.ts` (Create)
- `/src/features/chat/types.ts` (Update)

```typescript
// src/features/chat/components/message-input.tsx
export function MessageInput() {
  const [message, setMessage] = useState('');
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border p-2"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">
          Send
        </button>
      </div>
    </form>
  );
}
```

**Appwrite Setup:**
- No Appwrite configuration needed for this version

#### Test Strategy v0.2.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/components/__tests__/message-input.test.tsx
   describe('MessageInput', () => {
     it('handles input changes', () => {
       render(<MessageInput />);
       const input = screen.getByPlaceholderText('Type a message...');
       fireEvent.change(input, { target: { value: 'Test message' } });
       expect(input).toHaveValue('Test message');
     });

     it('disables send button when empty', () => {
       render(<MessageInput />);
       const button = screen.getByRole('button');
       expect(button).toBeDisabled();
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Input field accepts text
   - [ ] Send button is disabled when empty
   - [ ] Form submission works
   - [ ] Input clears after submission
   - [ ] Enter key submits form
   - [ ] Button states look correct:
     - Default state
     - Hover state
     - Active state
     - Disabled state

### v0.3.0: Message Bubble Component
**Files to Create/Modify:**
- `/src/features/chat/components/message-bubble.tsx` (Create)
- `/src/features/chat/types.ts` (Update)
- `/src/features/chat/components/message-list.tsx` (Update)
- `/src/features/members/types.ts` (Import)

```typescript
// src/features/chat/types.ts
import { Member } from '../members/types';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: Member;
  conversationId: string;
  createdAt: string;
  isOwn: boolean;
}

// src/features/chat/components/message-bubble.tsx
export function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start gap-2">
        {!message.isOwn && (
          <img 
            src={message.sender.avatar} 
            alt={message.sender.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="max-w-[70%] rounded-lg p-3 bg-primary/10">
          {!message.isOwn && (
            <div className="text-sm font-medium mb-1">{message.sender.name}</div>
          )}
          {message.content}
        </div>
      </div>
    </div>
  );
}
```

**Appwrite Setup:**
- No Appwrite configuration needed for this version

#### Test Strategy v0.3.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/components/__tests__/message-bubble.test.tsx
   describe('MessageBubble', () => {
     const mockMember = {
       id: '1',
       name: 'Test User',
       avatar: 'test-avatar.jpg',
       status: 'online'
     };

     it('renders member info for other messages', () => {
       render(<MessageBubble message={{ 
         isOwn: false, 
         content: 'Test',
         sender: mockMember 
       }} />);
       expect(screen.getByText('Test User')).toBeInTheDocument();
       expect(screen.getByAltText('Test User')).toBeInTheDocument();
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Own messages align right
   - [ ] Other messages align left
   - [ ] Member avatar displayed
   - [ ] Member name displayed
   - [ ] Member status shown
   - [ ] Long messages wrap correctly
   - [ ] Short messages display properly
   - [ ] Timestamps are visible

### v0.4.0: Message Sending API
**Files to Create/Modify:**
- `/src/features/chat/server/route.ts` (Create)
- `/src/features/chat/api/use-send-message.ts` (Create)
- `/src/features/chat/types.ts` (Update)
- `/src/features/chat/constants.ts` (Create)
- `/src/features/members/api/use-get-member.ts` (Import)

```typescript
// src/features/chat/server/route.ts
app.post("/messages", sessionMiddleware, async (c) => {
  const user = c.get("user");
  const databases = c.get("databases");
  const { content, conversationId, workspaceId } = await c.req.json();

  // Verify user is a member of the workspace
  const member = await databases.getDocument(
    DATABASE_ID,
    MEMBERS_ID,
    `${workspaceId}_${user.$id}`
  );

  if (!member) {
    return c.json({ error: "Not a workspace member" }, 403);
  }

  const message = await databases.createDocument(
    DATABASE_ID,
    MESSAGES_ID,
    ID.unique(),
    {
      content,
      conversationId,
      workspaceId,
      senderId: user.$id,
    }
  );

  return c.json({ data: message });
});
```

**Appwrite Setup:**
1. Create Messages Collection:
   - Collection ID: `messages`
   - Permissions:
     - Create: Workspace members only
     - Read: Workspace members only
     - Update: Message sender only
     - Delete: Message sender only
   - Attributes:
     - `content` (string, required)
     - `conversationId` (string, required)
     - `senderId` (string, required)
     - `workspaceId` (string, required)
     - `createdAt` (datetime, required)
     - `updatedAt` (datetime, required)

2. Add Collection to Constants:
   ```typescript
   // src/features/chat/constants.ts
   export const MESSAGES_ID = 'messages';
   ```

3. Link with Members Collection:
   - Add foreign key relationship to members collection
   - Set up proper indexing for member queries

#### Test Strategy v0.4.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/api/__tests__/use-send-message.test.ts
   describe('useSendMessage', () => {
     it('sends message successfully', async () => {
       const { result } = renderHook(() => useSendMessage());
       await act(async () => {
         await result.current.mutateAsync({ content: 'Test' });
       });
       expect(result.current.isSuccess).toBe(true);
     });

     it('handles empty messages', async () => {
       const { result } = renderHook(() => useSendMessage());
       await act(async () => {
         await result.current.mutateAsync({ content: '' });
       });
       expect(result.current.error).toBeDefined();
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Message appears in chat after sending
   - [ ] Loading state shows while sending
   - [ ] Error message displays if send fails
   - [ ] Input field clears after successful send
   - [ ] Send button disabled during sending

### v0.5.0: Message Fetching API
**Files to Create/Modify:**
- `/src/features/chat/api/use-get-messages.ts` (Create)
- `/src/features/chat/server/route.ts` (Update)
- `/src/features/chat/types.ts` (Update)
- `/src/features/chat/components/message-list.tsx` (Update)
- `/src/features/members/api/use-get-members.ts` (Import)

```typescript
// src/features/chat/api/use-get-messages.ts
export function useGetMessages(conversationId: string, workspaceId: string) {
  return useQuery({
    queryKey: ["messages", conversationId, workspaceId],
    queryFn: async () => {
      const response = await client.api.messages.$get({
        query: { 
          conversationId,
          workspaceId,
          orderBy: 'createdAt',
          limit: 50
        },
      });
      return response.json();
    },
  });
}
```

**Appwrite Setup:**
1. Add Indexes to Messages Collection:
   - Create index on `conversationId` for faster queries
   - Create index on `createdAt` for message ordering
   - Create index on `workspaceId` for member filtering
   - Create compound index on `[workspaceId, conversationId, createdAt]`

2. Add Collection Queries:
   - Order by `createdAt` ascending
   - Limit to 50 messages per query
   - Add cursor-based pagination
   - Filter by workspace membership

#### Test Strategy v0.5.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/api/__tests__/use-get-messages.test.ts
   describe('useGetMessages', () => {
     it('fetches messages for conversation', async () => {
       const { result } = renderHook(() => useGetMessages('test-conversation', 'test-workspace'));
       await waitFor(() => {
         expect(result.current.data).toBeDefined();
       });
     });

     it('handles empty conversations', async () => {
       const { result } = renderHook(() => useGetMessages('empty-conversation', 'empty-workspace'));
       await waitFor(() => {
         expect(result.current.data).toHaveLength(0);
       });
     });
   });
   ```

2. **Visual Inspection**
   - [ ] Messages load when opening chat
   - [ ] Loading state shows while fetching
   - [ ] Empty state shows when no messages
   - [ ] Error state shows if fetch fails
   - [ ] Messages display in correct order

### v0.6.0: Real-time Updates
**Files to Create/Modify:**
- `/src/features/chat/hooks/use-realtime-messages.ts` (Create)
- `/src/features/chat/components/message-list.tsx` (Update)
- `/src/features/chat/types.ts` (Update)
- `/src/features/chat/constants.ts` (Update)
- `/src/features/members/hooks/use-member-status.ts` (Import)

```typescript
// src/features/chat/hooks/use-realtime-messages.ts
export function useRealtimeMessages(conversationId: string, workspaceId: string) {
  const { data: messages, refetch } = useGetMessages(conversationId, workspaceId);
  const { data: members } = useGetMembers(workspaceId);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      [`conversations.${conversationId}`, `members.${workspaceId}`],
      (response) => {
        if (response.events.includes('messages')) {
          refetch();
        }
        if (response.events.includes('members')) {
          // Update member status
        }
      }
    );
    return () => unsubscribe();
  }, [conversationId, workspaceId]);

  return { messages, members };
}
```

**Appwrite Setup:**
1. Enable Realtime for Messages Collection:
   - Go to Appwrite Console
   - Navigate to Messages Collection
   - Enable Realtime feature
   - Set up WebSocket connections

2. Configure Realtime Permissions:
   - Allow workspace members to subscribe
   - Set up proper event filters by workspace
   - Configure reconnection settings
   - Link with member status updates

3. Add Realtime Constants:
   ```typescript
   // src/features/chat/constants.ts
   export const REALTIME_CHANNEL = 'messages';
   export const MEMBER_STATUS_CHANNEL = 'members';
   ```

#### Test Strategy v0.6.0
1. **Jest Unit Tests**
   ```typescript
   // src/features/chat/hooks/__tests__/use-realtime-messages.test.ts
   describe('useRealtimeMessages', () => {
     it('subscribes to conversation updates', () => {
       const { result } = renderHook(() => useRealtimeMessages('test-conversation', 'test-workspace'));
       expect(result.current.isConnected).toBe(true);
     });

     it('handles connection loss', async () => {
       const { result } = renderHook(() => useRealtimeMessages('test-conversation', 'test-workspace'));
       await act(async () => {
         result.current.disconnect();
       });
       expect(result.current.isConnected).toBe(false);
     });
   });
   ```

2. **Visual Inspection**
   - [ ] New messages appear instantly
   - [ ] Connection status indicator works
   - [ ] Reconnection works after disconnection
   - [ ] No duplicate messages
   - [ ] Messages stay in correct order

## Version Control Strategy

### Branch Naming
- Feature branches: `feature/chat-v0.1.0`, `feature/chat-v0.2.0`, etc.
- Release branches: `release/chat-v0.1.0`, `release/chat-v0.2.0`, etc.

### Tagging
- Each function version should be tagged: `v0.1.0`, `v0.2.0`, etc.
- Include function-specific tests in release notes

### Deployment
- Each function should be deployed to staging for testing
- Production deployment only after all tests pass 