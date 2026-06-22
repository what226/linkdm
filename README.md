# SocialHub AI - Instagram & Facebook Automation Platform

A modern SaaS platform for automating Instagram and Facebook business communications with AI-powered replies, unified inbox management, and advanced automation flows.

## 🚀 Platform Overview

**SocialHub AI** enables businesses to:
- Automate Instagram DM and Facebook Messenger responses
- Manage comments across multiple accounts from a unified inbox
- Build sophisticated automation workflows with conditional logic
- Generate AI-powered, brand-voice-consistent replies
- Track engagement metrics and lead generation
- Scale team management with role-based permissions

## 🏗️ Architecture

### Technology Stack

```
Frontend:     Next.js 15 + React + TypeScript + Tailwind CSS + Shadcn UI
Backend:      Node.js + NestJS + TypeScript
Database:     PostgreSQL (Primary) + Redis (Cache) + RabbitMQ (Queue)
Auth:         JWT + Meta OAuth 2.0
AI:           OpenAI GPT-4.1 / Google Gemini
Storage:      AWS S3
Deployment:   Docker + Docker Compose + Kubernetes (production)
```

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│              Dashboard | Automation | Analytics              │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL/REST APIs
┌────────────────────▼────────────────────────────────────────┐
│                  API Gateway (NestJS)                        │
│           Rate Limiting | Auth | Logging | Cache             │
└────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
     │          │          │          │          │
┌────▼──┐  ┌────▼──┐  ┌────▼──┐  ┌────▼──┐  ┌────▼──┐
│ Auth  │  │Social │  │Inbox  │  │ Inbox │  │ Lead  │
│Module │  │Module │  │Module │  │Module │  │Module │
└───────┘  └───────┘  └───────┘  └───────┘  └───────┘

┌─────────────────────────────────────────────────────────────┐
│               Background Services (Workers)                  │
│  Webhook Processor | Message Queue | AI Engine | Analytics   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Data Layer (PostgreSQL + Redis + S3)              │
│        Users | Accounts | Messages | Automation Flows        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
socialhub-ai/
├── frontend/                    # Next.js application
│   ├── app/                    # Next.js 15 app directory
│   ├── components/             # React components
│   ├── lib/                    # Utilities & hooks
│   ├── types/                  # TypeScript types
│   └── styles/                 # Tailwind configs
├── backend/                    # NestJS application
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   ├── common/            # Shared utilities
│   │   ├── config/            # Configuration
│   │   └── main.ts            # Entry point
│   └── test/                  # Test files
├── workers/                   # Background job processors
├── database/                  # Migrations & schemas
├── docker-compose.yml
├── docker-compose.prod.yml
├── k8s/                      # Kubernetes manifests
└── docs/                     # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- AWS Account (for S3)
- Meta Business Account (for Instagram/Facebook)
- OpenAI API Key (for GPT-4.1)

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/socialhub-ai.git
cd socialhub-ai

# Setup environment
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Start services
docker-compose up -d

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run migrations
npm run db:migrate

# Start development servers
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run start:dev

# Open browser
open http://localhost:3000
```

## 📊 Core Features

### 1. Social Account Management
- OAuth2 integration with Meta (Instagram/Facebook)
- Multi-account support
- Token health monitoring
- Real-time sync status

### 2. Unified Inbox
- Consolidated view of Instagram DMs and Facebook Messages
- Conversation threading
- Smart assignment to team members
- Advanced search and filtering
- AI-suggested replies

### 3. Automation Builder
- Visual drag-and-drop flow designer
- Keyword trigger detection
- Conditional branching
- Delayed message sequences
- Lead qualification workflows
- Multi-step conversations

### 4. AI Reply Assistant
- Brand voice customization
- Context-aware response generation
- Sentiment analysis
- Multi-model support (GPT-4.1, Gemini)
- A/B testing capabilities

### 5. Comment-to-DM Automation
- Instagram post/reel monitoring
- Keyword trigger detection
- Automatic DM and public replies
- Configurable delays
- AI-powered responses

### 6. Analytics & Reporting
- Message volume tracking
- Engagement metrics
- Link click tracking
- Conversion analytics
- Exportable reports
- Real-time dashboards

### 7. Team Management
- Role-based access control (Owner, Admin, Agent)
- Permission system
- Activity logs
- Team member invitations

### 8. Billing & Subscriptions
- Free tier
- Pro plan
- Agency plan
- Stripe integration
- Usage-based pricing
- Invoice management

## 🔐 Security Features

- End-to-end encrypted token storage
- JWT authentication with refresh tokens
- Meta webhook signature validation
- Rate limiting (Redis-based)
- RBAC with granular permissions
- Audit logging for all actions
- GDPR compliance
- Data encryption at rest
- SQL injection prevention
- XSS protection

## 📈 Scalability

### Horizontal Scaling
- Stateless API servers (load balanced)
- Database read replicas
- Redis cluster for caching
- RabbitMQ queue distribution
- CDN for static assets

### Vertical Scaling
- Database optimization
- Connection pooling
- Query optimization
- Batch processing
- Async job queue

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
npm run test:e2e
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Authentication Flow](./docs/AUTH.md)
- [Webhook Events](./docs/WEBHOOKS.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🔄 Workflow

### Message Automation Flow

```
Instagram Comment on Post
    ↓
Meta Webhook Event
    ↓
Webhook Receiver (NestJS)
    ↓
Event Queue (RabbitMQ)
    ↓
Webhook Processor Worker
    ↓
Automation Engine (Match Triggers)
    ↓
AI Engine (Generate Reply)
    ↓
Send DM + Post Comment Reply
    ↓
Update Analytics
    ↓
Log Event (Audit Trail)
```

## 💰 Monetization Model

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/mo | 1 account, 100 messages/month, basic automation |
| Pro | $99/mo | 5 accounts, 10k messages/month, advanced automation |
| Agency | $499/mo | 25 accounts, unlimited messages, team seats |

## 🛠️ Development

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- 80%+ test coverage
- Comprehensive error handling

### Git Workflow
```bash
# Feature branch
git checkout -b feature/amazing-feature

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

## 📞 Support & Contact

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/socialhub-ai/issues)
- Email: support@socialhubai.com
- Slack Community: [Join](https://socialhubai.slack.com)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) first.

---

**Built with ❤️ by the SocialHub AI Team**
