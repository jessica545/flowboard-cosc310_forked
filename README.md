# Flowboard

A modern project management application built with Next.js, Appwrite, and Tailwind CSS.

## Team

### Developers
- **Shahzeb Iqbal** [Team Lead]
- **Jessica**
- **Mark**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

Flowboard is a collaborative project management tool that allows teams to organize their work in workspaces, projects, and tasks. It provides a clean, intuitive interface for managing team workflows and tracking progress.

## Features

- **Authentication**: User registration, login, and session management
- **Workspaces**: Create and manage team workspaces
- **Projects**: Organize work into projects within workspaces
- **Tasks**: Create, assign, and track tasks with different statuses
- **Members**: Manage workspace members with different roles
- **Real-time Updates**: Stay in sync with your team's progress
- **Chat**: Communicate with team members within workspaces through real-time messaging
- **Theme Settings**: Customize your UI with light and dark mode preferences

## Project Structure

### Root Structure

```
flowboard/
├── src/                  # Source code
├── public/               # Static assets
├── certificates/         # SSL certificates for development
├── .next/                # Next.js build output
├── node_modules/         # Dependencies
├── .env.local            # Environment variables
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

### Source Code Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── (standalone)/     # Standalone pages
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components
│   ├── ui/               # Basic UI components
│   └── ...               # Higher-level components
├── features/             # Feature modules
│   ├── auth/             # Authentication
│   ├── workspaces/       # Workspaces
│   ├── projects/         # Projects
│   ├── tasks/            # Tasks
│   ├── members/          # Members
│   ├── chat/             # Chat functionality
│   └── settings/         # User settings
├── lib/                  # Utility functions and libraries
│   ├── appwrite.ts       # Appwrite client setup
│   ├── session-middleware.ts # Session handling
│   └── utils.ts          # General utilities
└── config.ts             # Application configuration
```

### Features Breakdown

#### Authentication (`src/features/auth/`)

- **Components**: Login and registration forms
- **Server**: Authentication API routes
- **Schemas**: Validation schemas for auth forms
- **Constants**: Authentication-related constants

#### Workspaces (`src/features/workspaces/`)

- **Components**: Workspace creation, listing, and management UI
- **Server**: Workspace API routes
- **Types**: Workspace data models
- **Schemas**: Validation schemas for workspace forms
- **API**: Client-side API hooks for workspaces
- **Hooks**: Custom hooks for workspace functionality

#### Projects (`src/features/projects/`)

- **Components**: Project creation, listing, and management UI
- **Server**: Project API routes
- **Types**: Project data models
- **Schemas**: Validation schemas for project forms
- **API**: Client-side API hooks for projects
- **Hooks**: Custom hooks for project functionality

#### Tasks (`src/features/tasks/`)

- **Components**: Task creation, listing, and management UI
- **Server**: Task API routes
- **Types**: Task data models and enums
- **Schemas**: Validation schemas for task forms
- **API**: Client-side API hooks for tasks
- **Hooks**: Custom hooks for task functionality

#### Members (`src/features/members/`)

- **Components**: Member management UI
- **Server**: Member API routes
- **Types**: Member roles and data models
- **Utils**: Utility functions for member operations

#### Chat (`src/features/chat/`)

- **Components**: 
  - Chat container with messaging interface
  - Message bubbles with user attribution
  - Message input with validation
  - Conversation list for selecting chats
  - Conversation creation dialog
- **Server**: Chat and messaging API routes
- **Types**: Message and conversation data models
- **API**: Client-side API hooks for real-time messaging
- **Hooks**: Custom hooks for managing chat state
- **Tests**: Unit and component tests for chat functionality

#### Settings (`src/features/settings/`)

- **Components**: Theme selection and account settings
- **Server**: User preferences API routes
- **Types**: Settings data models
- **API**: Client-side API hooks for user preferences
- **Hooks**: Theme management functionality

### Components Breakdown

#### UI Components (`src/components/ui/`)

Basic UI components built with Tailwind CSS and Radix UI:

- **Button**: Button component with variants
- **Card**: Card container component
- **Dialog**: Modal dialog component
- **Dropdown**: Dropdown menu component
- **Form**: Form components with validation
- **Input**: Text input component
- **Select**: Select dropdown component
- **Tabs**: Tabbed interface component
- **Avatar**: User avatar component
- **Badge**: Status badge component
- **Calendar**: Date picker calendar
- **Checkbox**: Checkbox input component
- **And more...**

#### Higher-level Components (`src/components/`)

- **Navbar**: Application navigation bar
- **Sidebar**: Application sidebar navigation
- **Projects**: Project listing component
- **Workspace-Switcher**: Component to switch between workspaces
- **Date-Picker**: Date selection component
- **Mobile-Sidebar**: Mobile-responsive sidebar
- **Query-Provider**: React Query provider setup
- **Theme-Switcher**: Toggle between light and dark themes

### API Routes

The application uses Hono.js for API routes:

- **/api/auth**: Authentication endpoints
- **/api/workspaces**: Workspace management
- **/api/projects**: Project management
- **/api/tasks**: Task management
- **/api/members**: Member management
- **/api/chat**: Chat and messaging
- **/api/settings**: User preferences

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below)
4. Run the development server:
   ```bash
   npm run dev
   ```
   
For HTTPS development:
```bash
npx next dev --experimental-https
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_APPWRITE_KEY=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=
NEXT_PUBLIC_APPWRITE_TASKS_ID=
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_ID=
NEXT_PUBLIC_APPWRITE_MESSAGES_ID=
```

## Testing

The application includes testing:

### Test Setup

```
__tests__/
├── chat-container.test.tsx    # Tests for the chat container component
├── message-input.test.tsx     # Tests for message input functionality
├── message-list.test.tsx      # Tests for message list display
├── message-bubble.test.tsx    # Tests for message bubbles
└── conversation-list.test.tsx # Tests for conversation selection
```

### Running Tests

```bash
npm test
```

### Chat Feature Test Coverage

The chat feature includes tests for:
- Component rendering and layout
- Form validation for message input
- Conversation creation functionality
- Message display with proper user attribution
- Error state handling
- Loading state visualization

### Future Test Improvements

- API integration tests for conversation creation
- Message sending and receiving between users
- Real-time update verification
- Authorization checks for conversation access
- Error handling in API calls

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
2. Make your changes
3. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request

## License

[MIT License](LICENSE)
