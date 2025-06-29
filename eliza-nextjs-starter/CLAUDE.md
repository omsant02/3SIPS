# CLAUDE CODE CONFIGURATION - ELIZA NEXT.JS STARTER

This file contains project-specific configuration and preferences for Claude Code.

---

## PROJECT INFORMATION
- **Project Name:** Eliza Next.js Starter
- **Working Directory:** `/Users/{user}/Documents/GitHub/eliza-nextjs-starter`
- **Git Repository:** Yes
- **Main Branch:** `main`
- **Project Type:** Hybrid Next.js Web App + ElizaOS Agent Package

---

## PROJECT OVERVIEW

This is a production-ready Next.js application for integrating with ElizaOS agents, featuring real-time messaging, proper agent participation management, and comprehensive error handling. The project serves a dual purpose:

1. **Next.js Web Application**: Real-time chat interface running on port 4000
2. **ElizaOS Agent Package**: Buildable agent with custom plugins

### Key Features
- Real-time agent communication via Socket.IO
- CORS-friendly API proxy pattern for browser-to-ElizaOS communication
- Agent participation management with automatic registration
- Session-based chat management with persistence
- Comprehensive error handling and connection recovery
- Framework-agnostic design patterns

---

## TECH STACK

### Core Technologies
- **Framework:** Next.js 15.3.1 with App Router
- **React:** 19.1.0 with React DOM
- **TypeScript:** v5 with strict configuration
- **Package Manager:** Bun (preferred) or npm
- **Node.js:** 18+ required

### Styling & UI
- **CSS Framework:** Tailwind CSS v4.0.0-beta
- **Icons:** Lucide React, Heroicons
- **Components:** Custom design system with Headless UI
- **Themes:** Dark/light mode with next-themes

### ElizaOS Integration
- **Core:** @elizaos/core v1.0.9
- **Plugins:** Anthropic, Groq, OpenAI, SQL plugins
- **Communication:** Socket.IO client for real-time messaging
- **CLI:** @elizaos/cli v1.0.9

### Build & Development
- **Builder:** tsup v8.4.0 for agent building
- **Testing:** Vitest v2.1.5 with coverage
- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier v3.5.3

---

## CRITICAL RULES

### Package Management
- **ALWAYS USE `bun` FOR ALL PACKAGE MANAGEMENT AND SCRIPT EXECUTION**
- **NEVER USE `npm` OR `pnpm`** unless explicitly required by project constraints
- **IF A COMMAND DOESN't WORK:** Read `package.json` to find correct script names

### Development Workflow
- **DUAL BUILD SYSTEM:** Project builds both Next.js app and ElizaOS agent
- **PORT CONFIGURATION:** Next.js runs on port 4000, ElizaOS server on port 3000
- **ENVIRONMENT SETUP:** Always check `.env` file for proper configuration
- **CONCURRENT DEVELOPMENT:** Use `bun run dev:with-agent` for full stack development

### ElizaOS Integration
- **AGENT PARTICIPATION:** Agents must be added to channels for message processing
- **CORS HANDLING:** All ElizaOS API calls must go through `/api/eliza/[...path]` proxy
- **SOCKET CONNECTION:** Direct Socket.IO connection to ElizaOS server (not proxied)
- **MESSAGE FILTERING:** Filter messages by `senderId` to avoid duplicates
- **CHANNEL MANAGEMENT:** Use centralized bus pattern (`00000000-0000-0000-0000-000000000000`)

### Code Quality
- **TYPESCRIPT:** Maintain strict typing for all new code
- **ERROR HANDLING:** Implement comprehensive error boundaries and recovery
- **LOGGING:** Use consistent console logging patterns with prefixes
- **TESTING:** Write tests for core functionality, especially ElizaOS integration

---

## COMMON COMMANDS

```bash
# Development
bun run dev                    # Next.js only (port 4000)
bun run dev:with-agent        # Both ElizaOS agent and Next.js concurrently
bun start                     # Production mode (port 4000)

# Building
bun run build                 # Build both agent and Next.js app
bun run build:next-only       # Build Next.js app only

# Code Quality
bun run lint                  # Format code with Prettier
bun run format                # Same as lint
bun run format:check          # Check formatting without changes

# Testing
bun run test                  # Run Vitest tests
bun run test:coverage         # Run tests with coverage report
bun run test:watch            # Run tests in watch mode
```

---

## PROJECT STRUCTURE

### Key Directories
```
src/
├── app/                      # Next.js App Router
│   ├── (app)/               # App layout group
│   │   ├── chat/[sessionId] # Chat interface with sessions
│   │   └── explore/         # Discovery page
│   ├── (landing)/           # Landing page layout
│   ├── (marketing)/         # Marketing pages (privacy, terms)
│   ├── api/                 # API routes
│   │   ├── eliza/[...path]  # ElizaOS API proxy (CRITICAL)
│   │   ├── chat-session/    # Session management
│   │   └── dm-channel/      # DM channel management
│   └── globals.css          # Global styles
├── components/              # Reusable UI components
├── lib/                     # Core utilities
│   ├── api-client.ts        # ElizaOS API wrapper
│   ├── socketio-manager.ts  # Real-time communication
│   └── local-storage.ts     # Client persistence
├── types/                   # TypeScript definitions
├── plugin-*/               # Custom ElizaOS plugins
└── agent.ts                # ElizaOS agent definition
```

### Critical Files
- **`src/agent.ts`**: ElizaOS agent configuration and character definition
- **`src/lib/socketio-manager.ts`**: Real-time messaging implementation
- **`src/lib/api-client.ts`**: ElizaOS API integration with CORS handling
- **`src/app/api/eliza/[...path]/route.ts`**: Critical API proxy for CORS
- **`docs/eliza-messaging-system.md`**: Comprehensive ElizaOS integration guide

---

## ENVIRONMENT CONFIGURATION

### Required Variables
```env
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:4000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=true
NEXT_PUBLIC_NODE_ENV="development"

# ElizaOS Agent Configuration
NEXT_PUBLIC_AGENT_ID=your-agent-id-here
NEXT_PUBLIC_WORLD_ID=00000000-0000-0000-0000-000000000000

# Optional API Authentication
NEXT_PUBLIC_API_KEY=your-api-key-if-needed
```

### Optional Variables
```env
# Debug Mode (shows debug panel with connection details)
NEXT_PUBLIC_DEBUG=true

# Repository Context (for agent knowledge)
REPO_DIR_NAME=elizaos
REPO_URL=https://github.com/elizaos/eliza.git
REPO_BRANCH=v2-develop
```

### ElizaOS Server Requirements
Ensure your ElizaOS instance has required API keys:
```env
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

---

## ARCHITECTURAL PATTERNS

### ElizaOS Integration Flow
```
[Next.js Client] → [API Proxy] → [ElizaOS Server] → [Message Bus] → [Agent Runtime]
       ↑                                                                    ↓
[Socket.IO UI] ← [ElizaOS Socket.IO] ← [Message Bus] ← [Agent Response] ← [Agent Processing]
```

### Key Implementation Patterns

#### 1. Agent Participation Setup (CRITICAL)
```typescript
// Add agent to centralized channel for message processing
await fetch('/api/eliza/messaging/central-channels/00000000-0000-0000-0000-000000000000/agents', {
  method: 'POST',
  body: JSON.stringify({ agentId: 'your-agent-id' })
});
```

#### 2. Message Broadcasting (Real-time)
```typescript
// Listen for messages from central bus
socket.on('messageBroadcast', (data) => {
  const isCentralChannel = data.channelId === '00000000-0000-0000-0000-000000000000';
  if (isCentralChannel && data.senderId !== userEntity) {
    displayAgentMessage(data);
  }
});
```

#### 3. API Proxy Pattern (CORS Solution)
```typescript
// All ElizaOS API calls go through Next.js proxy
const response = await fetch('/api/eliza/server/ping'); // Proxied
// Never: fetch('http://localhost:3000/api/server/ping'); // CORS blocked
```

### Session Management
- **DM Channels**: Organizational containers for conversation persistence
- **User Entities**: Persistent UUIDs stored in localStorage
- **Session History**: Dual-source loading (channel messages + room memories)
- **Real-time Updates**: Socket.IO with channel-based filtering

---

## DEVELOPMENT GUIDELINES

### Code Style & Structure
- **TypeScript**: Use strict typing for all new code
- **Functional Programming**: Prefer functional patterns over classes
- **Error Boundaries**: Implement comprehensive error handling
- **Logging**: Use consistent `[Component] Message` format
- **Components**: Follow existing design system patterns

### Naming Conventions
- **Components**: PascalCase (`ChatMessage.tsx`)
- **Hooks**: camelCase starting with `use` (`useLocalStorage.ts`)
- **Types**: PascalCase interfaces (`ChatMessage`, `SocketIOManager`)
- **Constants**: UPPER_SNAKE_CASE (`USER_NAME`, `CHAT_SOURCE`)
- **API Routes**: kebab-case directories (`chat-session`, `dm-channel`)

### File Organization
- **Components**: One component per file with co-located types
- **Utilities**: Shared utilities in `src/lib/`
- **Types**: Centralized in `src/types/` for complex types
- **API Routes**: Grouped by functionality in `src/app/api/`

---

## COMMON ISSUES & SOLUTIONS

### 1. "Agent not responding"
**Cause**: Agent not added to channel
**Solution**: Check browser console for agent participation setup logs
**Debug**: Enable `NEXT_PUBLIC_DEBUG=true` to see connection states

### 2. "CORS errors when calling ElizaOS"
**Cause**: Direct browser-to-ElizaOS requests blocked
**Solution**: All requests automatically proxied via `/api/eliza/*`
**Never**: Make direct requests to ElizaOS server from browser

### 3. "Message duplication in UI"
**Cause**: Poor message filtering
**Solution**: App filters own messages by `senderId`
**Check**: Ensure `userEntity` is properly set and persisted

### 4. "Socket connection failed"
**Cause**: ElizaOS server not running or wrong URL
**Solution**: Verify `NEXT_PUBLIC_SERVER_URL` and server status
**Debug**: Check network tab for Socket.IO connection attempts

### 5. "Build failures"
**Cause**: Missing environment variables or dependency issues
**Solution**: Check `.env` file and run `bun install`
**Agent Build**: Ensure ElizaOS dependencies are properly externalized

---

## TESTING STRATEGY

### Test Structure
- **Unit Tests**: Core utilities and components
- **Integration Tests**: ElizaOS API integration
- **E2E Tests**: Full chat flow testing
- **Coverage**: Aim for >80% coverage on critical paths

### Running Tests
```bash
bun run test              # Run all tests
bun run test:coverage     # Generate coverage report
bun run test:watch        # Watch mode for development
```

### Testing Patterns
- **Mock ElizaOS**: Use test doubles for ElizaOS server
- **Socket.IO Testing**: Mock Socket.IO events and connections
- **Component Testing**: Test UI components in isolation
- **API Testing**: Test proxy routes and error handling

---

## DEPLOYMENT CONSIDERATIONS

### Production Environment
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SERVER_URL=https://your-elizaos-server.com
NEXT_PUBLIC_AGENT_ID=your-production-agent-id
NEXT_TELEMETRY_DISABLED=true
NEXT_PUBLIC_NODE_ENV="production"
```

### Build Process
1. **Agent Build**: `tsup` compiles agent to `dist/agent.js`
2. **Next.js Build**: Standard Next.js production build
3. **Asset Optimization**: Images, CSS, and JS optimization
4. **Environment Validation**: Check all required env vars

### Performance Considerations
- **Socket.IO**: Single connection with proper cleanup
- **Message History**: Pagination for large conversations
- **Real-time Updates**: Efficient message filtering
- **Build Size**: Externalized ElizaOS dependencies

---

## DOCUMENTATION

### Key Documentation Files
- **`README.md`**: Complete setup and usage guide
- **`docs/eliza-messaging-system.md`**: Comprehensive ElizaOS integration guide
- **`package.json`**: All available scripts and dependencies
- **`.env.example`**: Environment variable template (if exists)

### Additional Resources
- **ElizaOS Documentation**: https://github.com/elizaos/eliza
- **Next.js Documentation**: https://nextjs.org/docs
- **Socket.IO Documentation**: https://socket.io/docs/

---

## MAINTENANCE TASKS

### Regular Updates
- **Dependencies**: Update ElizaOS packages regularly for latest features
- **Security**: Monitor for security updates in dependencies
- **Performance**: Profile Socket.IO and API performance
- **Documentation**: Keep implementation docs in sync with code changes

### Monitoring
- **ElizaOS Server Health**: Regular ping checks
- **Socket.IO Connections**: Monitor connection stability
- **Error Rates**: Track API and Socket.IO errors
- **Message Latency**: Monitor real-time message delivery

---

## GETTING HELP

### Troubleshooting Steps
1. **Check Environment**: Verify `.env` configuration
2. **ElizaOS Server**: Ensure server is running and accessible
3. **Browser Console**: Check for connection and API errors
4. **Network Tab**: Verify API proxy and Socket.IO connections
5. **Debug Mode**: Enable `NEXT_PUBLIC_DEBUG=true` for detailed info

### Support Resources
- **Project Issues**: GitHub Issues for this repository
- **ElizaOS Support**: https://github.com/elizaos/eliza/issues
- **Next.js Support**: https://github.com/vercel/next.js/discussions
- **Discord Community**: ElizaOS Discord server

---

**Built with ❤️ for the ElizaOS community**
