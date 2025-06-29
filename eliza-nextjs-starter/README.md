# ElizaOS Next.js Starter

A production-ready Next.js application for integrating with ElizaOS agents, featuring real-time messaging, proper agent participation management, and comprehensive error handling.

## 🚀 Features

- **Real-time Agent Communication**: Full Socket.IO integration with ElizaOS messaging system
- **Agent Participation Management**: Automatic agent registration to channels for reliable message processing
- **CORS-Friendly Architecture**: API proxy pattern for seamless browser-to-ElizaOS communication
- **Error Handling & Recovery**: Robust connection management with proper error states
- **Framework Agnostic Design**: Patterns that work across different platforms and frameworks
- **Comprehensive Documentation**: Detailed ElizaOS messaging system documentation included

## 🏗️ Architecture

This starter implements the complete ElizaOS messaging flow:

```
[Next.js Client] → [API Proxy] → [ElizaOS Server] → [Message Bus] → [Agent Runtime]
       ↑                                                                    ↓
[Socket.IO UI] ← [ElizaOS Socket.IO] ← [Message Bus] ← [Agent Response] ← [Agent Processing]
```

### Key Components

- **Agent Participation Setup**: Ensures agents can receive and process messages
- **Centralized Bus Channel**: Uses ElizaOS default channel (`00000000-0000-0000-0000-000000000000`)
- **Message Flow Management**: Handles both user messages and agent responses
- **Real-time Updates**: Socket.IO integration for instant message delivery

## 📋 Prerequisites

- **Node.js 18+** or **Bun**
- **ElizaOS Server** running on localhost:3000 (or configured URL)
- **Active ElizaOS Agent** with valid agent ID

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eliza-nextjs-starter
bun install  # or npm install
```

### 2. Environment Configuration

Create a `.env` file:

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

# Debug Mode (shows debug panel with connection details)
# NEXT_PUBLIC_DEBUG=true

# Repository Context (Optional)
REPO_DIR_NAME=elizaos
REPO_URL=https://github.com/elizaos/eliza.git
REPO_BRANCH=v2-develop
```

### 3. ElizaOS Server Setup

Ensure your ElizaOS instance is running with required API keys:

```env
# In your ElizaOS .env file
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 4. Start Development Server

```bash
bun run dev  # or npm run dev
```

Visit [http://localhost:4000](http://localhost:4000)

## 🔧 How It Works

### Agent Participation Flow

1. **Agent Registration**: App automatically adds agent to centralized channel
2. **Socket Connection**: Establishes real-time connection to ElizaOS
3. **Message Routing**: User messages → Central Channel → Agent Processing
4. **Response Handling**: Agent responses → Socket.IO → UI Update

### Key Implementation Details

```typescript
// 1. Add agent to channel (critical for message processing)
await fetch('/api/eliza/messaging/central-channels/00000000-0000-0000-0000-000000000000/agents', {
  method: 'POST',
  body: JSON.stringify({ agentId: 'your-agent-id' })
});

// 2. Handle centralized channel messages
socket.on('messageBroadcast', (data) => {
  const isCentralChannel = data.channelId === '00000000-0000-0000-0000-000000000000';
  if (isCentralChannel && data.senderId !== userEntity) {
    displayAgentMessage(data);
  }
});
```

## 📚 Documentation

### ElizaOS Messaging System

Comprehensive documentation is available at [`/docs/eliza-messaging-system.md`](./docs/eliza-messaging-system.md), covering:

- **Architecture Overview**: Core components and message flow
- **Entity Model**: Worlds, Rooms, Entities, and Memories explained
- **Implementation Patterns**: Framework-agnostic code examples
- **Troubleshooting Guide**: Common issues and solutions
- **Best Practices**: Production considerations and scaling

### API Endpoints

The app provides CORS-friendly proxy endpoints:

- `GET /api/eliza/server/ping` - Server health check
- `POST /api/eliza/messaging/central-channels/:channelId/messages` - Send messages
- `POST /api/eliza/messaging/central-channels/:channelId/agents` - Add agents
- `GET /api/eliza/messaging/central-channels/:channelId/participants` - List participants

## 🚨 Common Issues & Solutions

### 1. "Agent not responding"
**Cause**: Agent not added to channel
**Solution**: Check browser console for agent participation setup logs

### 2. "CORS errors"
**Cause**: Direct browser-to-ElizaOS requests blocked
**Solution**: All requests automatically proxied via `/api/eliza/*`

### 3. "Message duplication"
**Cause**: Poor message filtering
**Solution**: App filters own messages by `senderId`

### 4. "Connection failed"
**Cause**: ElizaOS server not running or wrong URL
**Solution**: Verify `NEXT_PUBLIC_SERVER_URL` and server status

## 🔍 Development

### Debug Mode

Enable the debug panel by setting `NEXT_PUBLIC_DEBUG=true` in your `.env` file:

```env
NEXT_PUBLIC_DEBUG=true
```

Debug mode provides:

- **Debug Panel**: Agent ID, Room ID, User Entity, connection states
- **Connection Status**: Real-time connection state display
- **Agent Status**: Participation setup progress
- **Message Logs**: Full message flow in browser console (always available)

### Testing

```bash
bun run build    # Test production build
bun run lint     # Code quality check
bun run type-check  # TypeScript validation
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SERVER_URL=https://your-elizaos-server.com
NEXT_PUBLIC_AGENT_ID=your-production-agent-id
NEXT_TELEMETRY_DISABLED=true
NEXT_PUBLIC_NODE_ENV="production"
```

### Build & Deploy

```bash
bun run build
bun start  # or deploy to Vercel, Netlify, etc.
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ElizaOS](https://github.com/elizaos/eliza) - The agent framework this integrates with
- [Next.js](https://nextjs.org/) - React framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📞 Support

- **Documentation**: [`/docs/eliza-messaging-system.md`](./docs/eliza-messaging-system.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **ElizaOS**: [Official Repository](https://github.com/elizaos/eliza)

---

**Built with ❤️ for the ElizaOS community**