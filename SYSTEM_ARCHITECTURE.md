# SocialHub AI - System Architecture Document

## Executive Summary

SocialHub AI is a modern, scalable SaaS platform designed to automate Instagram and Facebook messaging and comment management using AI. Built with production-grade architecture supporting 1000+ concurrent users and millions of messages per month.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Service Components](#service-components)
6. [API Architecture](#api-architecture)
7. [Database Design](#database-design)
8. [Message Queue System](#message-queue-system)
9. [Caching Strategy](#caching-strategy)
10. [Security Architecture](#security-architecture)
11. [Scalability & Performance](#scalability--performance)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  Next.js 15 | React | TypeScript | Tailwind CSS | Shadcn UI    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS & WebSocket
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    API Layer (NestJS)                            │
│      Auth | Users | Workspaces | Social Accounts | Messages     │
│      Comments | Automation | Analytics | Leads | Billing        │
└────────────┬────────────────────────────────┬────────────────────┘
             │                                │
    ┌────────▼──────────┐        ┌────────────▼─────────┐
    │  PostgreSQL       │        │  Redis Cache         │
    │  Primary DB       │        │  Session & Cache     │
    └────────────────────┘       └──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │   Background Workers           │
    │   (Webhook Processing)         │
    │   (AI Inference)               │
    │   (Scheduled Tasks)            │
    │   (Email Notifications)        │
    └────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** Next.js 15 with React and TypeScript

**Components:**
- Landing page & marketing
- Authentication screens
- Dashboard with real-time updates
- Conversation/inbox management
- Automation builder
- Analytics dashboard
- Admin panel

**Features:**
- Server-side rendering (SSR) for performance
- Static site generation (SSG) for marketing pages
- API route handlers for backend communication
- Real-time updates via WebSocket
- Offline-first capabilities with Service Workers
- Progressive Web App (PWA) features

### 2. API Layer (Backend)

**Technology:** NestJS with TypeScript

**Modules:**
```
auth/          - JWT, OAuth2, Session management
users/         - User profiles, settings, preferences
workspaces/    - Team management, permissions
social-accounts/ - Instagram/Facebook integration
conversations/ - DM thread management
messages/      - Message CRUD operations
comments/      - Comment management and replies
automation/    - Flow creation and execution
ai/            - AI model integration and inference
analytics/     - Event tracking and reporting
webhooks/      - Meta webhook handling
leads/         - Lead capture and qualification
billing/       - Subscription and payment
notifications/ - Email, SMS, push notifications
```

### 3. Data Layer

**Components:**
- **PostgreSQL:** Relational data (users, messages, automation)
- **Redis:** Caching, sessions, rate limiting
- **RabbitMQ:** Asynchronous job queues
- **S3:** File storage (images, documents, exports)
- **Elasticsearch:** Full-text search (optional)

### 4. Integration Layer

**External Services:**
- **Meta API:** Instagram/Facebook data and messaging
- **OpenAI API:** GPT-4 for reply generation
- **Google Gemini:** Alternative AI provider
- **Stripe:** Payment processing
- **SendGrid/Mailgun:** Email delivery
- **Slack/Discord:** Team notifications

---

## Technology Stack

### Frontend

```
┌─ Framework
│  └─ Next.js 15 (React 18 + App Router)
│
├─ Language: TypeScript
│
├─ Styling
│  ├─ Tailwind CSS
│  └─ Shadcn UI Components
│
├─ State Management
│  ├─ Zustand (global state)
│  └─ React Hook Form (form state)
│
├─ Data Fetching
│  ├─ SWR (React Hooks)
│  └─ TanStack Query
│
├─ UI/UX
│  ├─ Framer Motion (animations)
│  ├─ Lucide React (icons)
│  ├─ React Hot Toast (notifications)
│  └─ React Virtualized (large lists)
│
├─ Charts & Visualization
│  ├─ Recharts
│  ├─ Chart.js
│  └─ Visx
│
├─ Authentication
│  └─ NextAuth.js
│
└─ Utilities
   ├─ Axios (HTTP client)
   ├─ Date-fns (date manipulation)
   └─ Lodash-es (utility functions)
```

### Backend

```
┌─ Framework: NestJS 10 (Node.js + Express)
│
├─ Language: TypeScript
│
├─ Database
│  ├─ TypeORM (ORM)
│  └─ PostgreSQL Driver
│
├─ Authentication
│  ├─ Passport.js
│  ├─ JWT Strategy
│  └─ OAuth2 (Meta, Google)
│
├─ Caching
│  ├─ Redis
│  ├─ Cache Manager
│  └─ ioredis client
│
├─ Message Queue
│  ├─ RabbitMQ
│  ├─ Bull (job queue)
│  └─ AMQP connection manager
│
├─ AI Integration
│  ├─ OpenAI SDK
│  └─ Google Generative AI
│
├─ File Storage
│  └─ AWS SDK (S3)
│
├─ Payment Processing
│  └─ Stripe SDK
│
├─ Email Service
│  ├─ Nodemailer
│  └─ SendGrid API
│
├─ Validation
│  ├─ Class Validator
│  └─ Joi
│
├─ Logging
│  ├─ Pino (logger)
│  └─ Sentry (error tracking)
│
└─ Documentation
   └─ Swagger/OpenAPI
```

### Database

```
┌─ Primary: PostgreSQL 15
│  ├─ ACID compliance
│  ├─ JSON/JSONB support
│  ├─ Full-text search
│  └─ Partitioning for large tables
│
├─ Caching: Redis 7
│  ├─ Session storage
│  ├─ Query result caching
│  ├─ Rate limiting counters
│  └─ Real-time features
│
├─ Message Queue: RabbitMQ 3.12
│  ├─ Webhook processing
│  ├─ AI inference jobs
│  ├─ Email sending
│  └─ Analytics aggregation
│
└─ File Storage: AWS S3
   ├─ Profile pictures
   ├─ Automation exports
   ├─ Report PDFs
   └─ Backup files
```

---

## Data Flow

### Message Receiving Flow

```
1. User sends Instagram DM
   ↓
2. Meta sends webhook to SocialHub
   ↓
3. Webhook receiver validates signature
   ↓
4. Event published to RabbitMQ queue
   ↓
5. Webhook processor worker receives event
   ↓
6. Check automation flows (triggers)
   ↓
7. Create message record in DB
   ↓
8. Update conversation (unread count)
   ↓
9. Publish real-time event via WebSocket
   ↓
10. Frontend receives and displays message
```

### Comment Automation Flow

```
1. User comments on Instagram post
   ↓
2. Meta webhook sent to SocialHub
   ↓
3. Webhook processor validates
   ↓
4. Check comment automation flows
   ↓
5. Match comment text against keywords
   ↓
6. If match found:
   a. Queue AI generation job
   b. Generate DM response using GPT-4
   c. Send DM to commenter
   d. Post public reply on comment
   ↓
7. Track in analytics
   ↓
8. Update conversation with auto-reply marker
```

### Automation Execution Flow

```
1. Trigger event detected (comment/message/schedule)
   ↓
2. Load automation flow definition
   ↓
3. Execute flow steps sequentially
   ↓
4. Each step:
   - Evaluate conditions
   - Generate AI response (if needed)
   - Send message/DM/email
   - Handle delays
   ↓
5. Track execution and metrics
   ↓
6. Log in audit trail
   ↓
7. Notify user of completion
```

---

## Service Components

### 1. Authentication Service

```typescript
Features:
- Email/password signup
- Google OAuth 2.0
- Meta (Instagram/Facebook) OAuth 2.0
- JWT access tokens + refresh tokens
- Two-factor authentication (TOTP)
- Session management
- Password reset flow
- Email verification

Security:
- bcrypt password hashing
- Encrypted token storage
- Secure cookie handling
- Rate limiting on auth endpoints
- CSRF protection
```

### 2. Social Accounts Service

```typescript
Responsibilities:
- Store social account credentials
- Encrypt access tokens
- Handle token refresh
- Monitor token health
- Sync account data (followers, bios)
- Webhook subscription management
- Account disconnect/cleanup

Features:
- Multiple accounts per workspace
- Token expiration monitoring
- Automatic token refresh
- Account sync status tracking
- Error handling and retries
```

### 3. Message Processing Service

```typescript
Pipeline:
1. Receive webhook from Meta
2. Validate webhook signature
3. Extract message data
4. Store in database
5. Update conversation metadata
6. Check for automation triggers
7. Publish real-time event
8. Send push notifications

Features:
- Idempotent message handling
- Duplicate detection
- Sentiment analysis
- Link extraction
- Media handling
```

### 4. Automation Engine

```typescript
Components:
- Flow Builder (visual designer)
- Flow Executor (runtime)
- Step Handler (execute actions)
- Condition Evaluator
- Delay Manager

Supported Steps:
- Send DM
- Send comment
- Send email
- Wait/delay
- Conditional logic
- AI generation
- Lead qualification
```

### 5. AI Reply Service

```typescript
Features:
- Multiple AI models (GPT-4, Gemini)
- Brand voice customization
- Context-aware responses
- Temperature and token configuration
- Prompt templates
- Response caching
- Fallback handling
- Error recovery

Flow:
1. Get original message/comment
2. Load AI prompt template
3. Load brand voice guidelines
4. Generate reply with OpenAI
5. Cache result
6. Return to UI
```

### 6. Analytics Service

```typescript
Metrics Tracked:
- Messages received/sent
- Comments received/replied
- Automation triggers
- AI responses generated
- Link clicks
- Engagement rates
- Response times
- Conversion metrics

Data Collection:
- Real-time event tracking
- Daily aggregation
- Monthly reporting
- Export capabilities
```

### 7. Lead Management Service

```typescript
Features:
- Lead capture from messages
- Automatic lead qualification
- Lead scoring
- CRM integration
- Lead tagging
- Interaction tracking
- Follow-up automation

Qualification Rules:
- Engagement level
- Response patterns
- Message sentiment
- Conversion intent signals
```

---

## API Architecture

### REST API Design

```
Endpoints Structure:
GET    /api/v1/workspaces/:id                   # Get workspace
GET    /api/v1/workspaces/:id/conversations    # List conversations
GET    /api/v1/workspaces/:id/conversations/:id/messages  # Get messages
POST   /api/v1/workspaces/:id/conversations/:id/messages  # Send message
GET    /api/v1/workspaces/:id/automation-flows # List automation
POST   /api/v1/workspaces/:id/automation-flows/:id/execute  # Run automation

Versioning: URI-based (/api/v1, /api/v2)
Rate Limiting: 100 requests per 15 minutes
Authentication: Bearer JWT token
```

### WebSocket Real-Time Updates

```typescript
Events:
- message:received
- message:sent
- comment:created
- comment:replied
- automation:executed
- conversation:updated
- user:online/offline
- notification:new

Connection:
- Automatic reconnection
- Message buffering during disconnection
- Presence broadcasting
```

---

## Database Design

### Key Tables & Relationships

```
users (1) ──────── (M) user_oauth_providers
   │
   ├──────────────── (M) workspaces (owner)
   │
   └──────────────── (M) workspace_members (user)
                            │
                            ├──────────────── (M) social_accounts
                            │                      │
                            │                      ├──────────────── (M) conversations
                            │                      │                      │
                            │                      │                      └──────── (M) messages
                            │                      │                                     │
                            │                      │                                     └──── ai_replies
                            │                      │
                            │                      └──────────────── (M) comments
                            │                                             │
                            │                                             └──── ai_replies
                            │
                            ├──────────────── (M) automation_flows
                            │                      │
                            │                      └──────────────── (M) automation_steps
                            │                      │
                            │                      └──────────────── (M) automation_executions
                            │
                            ├──────────────── (M) ai_prompts
                            │
                            ├──────────────── (M) lead_contacts
                            │
                            └──────────────── (M) subscriptions
                                                   │
                                                   └──────────────── (1) subscription_plans
```

### Indexing Strategy

```sql
-- High-traffic query optimization
CREATE INDEX idx_conversations_workspace_status 
  ON conversations(workspace_id, status);

CREATE INDEX idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_comments_account_date 
  ON comments(social_account_id, created_at DESC);

CREATE INDEX idx_automation_active 
  ON automation_flows(workspace_id, is_active);

CREATE INDEX idx_analytics_date 
  ON daily_analytics(workspace_id, date DESC);

-- Text search
CREATE INDEX idx_messages_content_gin 
  ON messages USING GIN(to_tsvector('english', content));
```

---

## Message Queue System

### RabbitMQ Architecture

```
Exchanges:
├─ socialhub.webhooks (topic exchange)
│  ├─ socialhub.webhooks.message.received
│  ├─ socialhub.webhooks.comment.created
│  └─ socialhub.webhooks.account.updated
│
├─ socialhub.ai (topic exchange)
│  ├─ socialhub.ai.reply.generate
│  └─ socialhub.ai.analyze.sentiment
│
├─ socialhub.notifications (topic exchange)
│  ├─ socialhub.notifications.email
│  ├─ socialhub.notifications.push
│  └─ socialhub.notifications.slack
│
└─ socialhub.analytics (topic exchange)
   └─ socialhub.analytics.event.track
```

### Job Processing

```typescript
Priority Queues:
- HIGH: Webhook processing, real-time messages
- MEDIUM: AI generation, email notifications
- LOW: Analytics aggregation, cleanup tasks

Retry Strategy:
- Max retries: 3
- Initial delay: 5 seconds
- Exponential backoff
- Dead letter queue for failed jobs

Dead Letter Queue Processing:
- Failed jobs stored separately
- Manual review interface
- Automatic retry after fix
```

---

## Caching Strategy

### Cache Layers

```
Level 1: Database Query Results
├─ Conversations list (5 min)
├─ User preferences (10 min)
├─ Automation flows (10 min)
└─ Social account data (15 min)

Level 2: Computed Data
├─ Analytics dashboards (1 hour)
├─ Lead scores (30 min)
└─ Conversation statistics (5 min)

Level 3: Session & Auth
├─ User sessions (24 hours)
├─ OAuth tokens (varies)
└─ Rate limit counters (15 min)

Level 4: Static Content
├─ API responses (varies)
├─ Configuration (1 hour)
└─ Feature flags (5 min)
```

### Cache Invalidation

```typescript
Strategies:
- Time-based (TTL)
- Event-based (cache bust on update)
- Manual invalidation (admin action)

Examples:
- Update conversation → invalidate conversation list + details
- Send message → invalidate conversation messages + unread count
- Update AI prompt → invalidate cached replies
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────┐
│  Request        │
└────────┬────────┘
         │
    ┌────▼─────────────┐
    │ JWT Verification │
    └────┬─────────────┘
         │
    ┌────▼──────────────────┐
    │ User Validation       │
    └────┬──────────────────┘
         │
    ┌────▼───────────────────┐
    │ Workspace Check        │
    └────┬───────────────────┘
         │
    ┌────▼────────────────────┐
    │ Permission Check (RBAC) │
    └────┬────────────────────┘
         │
    ┌────▼─────────────────┐
    │ Request Authorized   │
    └─────────────────────┘
```

### RBAC (Role-Based Access Control)

```
Roles:
├─ Owner
│  └─ Full access, billing, member management
├─ Admin
│  └─ Settings, automation, team management
└─ Agent
   └─ View/reply to messages, create automations

Permissions:
├─ conversations:read/write
├─ messages:read/write/send
├─ automation:create/edit/delete
├─ analytics:read
├─ team:manage
└─ billing:manage
```

### Data Security

```
Encryption:
├─ At Rest (AES-256)
│  ├─ Social account tokens
│  ├─ OAuth credentials
│  └─ API keys
│
├─ In Transit (TLS 1.3)
│  ├─ All HTTPS connections
│  └─ WebSocket over WSS
│
└─ Application Level
   ├─ Password hashing (bcrypt)
   └─ Sensitive field encryption

Secrets Management:
├─ Environment variables
├─ AWS Secrets Manager
└─ HashiCorp Vault (production)
```

---

## Scalability & Performance

### Horizontal Scaling

```
Load Balancer (ALB)
    │
    ├─ Backend Pod 1
    ├─ Backend Pod 2
    ├─ Backend Pod 3
    └─ Backend Pod N (auto-scaled)

Auto-scaling Triggers:
- CPU > 70% → scale up
- Memory > 80% → scale up
- Requests > 1000/sec → scale up
```

### Database Scaling

```
Master (Write)
    │
    ├─ Read Replica 1 (Analytics, Reports)
    ├─ Read Replica 2 (Search, Export)
    └─ Read Replica 3 (Backup)

Connection Pool:
- Min connections: 5
- Max connections: 20
- Idle timeout: 30 min
```

### Performance Optimization

```
1. Database Query Optimization
   - Index optimization
   - Query analysis with EXPLAIN
   - N+1 query elimination
   - Lazy loading

2. Caching Strategy
   - Multi-tier caching
   - Cache warming
   - Intelligent invalidation

3. API Optimization
   - Response compression
   - JSON minification
   - Pagination
   - Partial responses

4. Frontend Optimization
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle analysis

5. Real-time Optimization
   - WebSocket compression
   - Message batching
   - Room-based subscriptions
```

### Monitoring & Observability

```
Metrics:
- API response times (p50, p95, p99)
- Database query duration
- Message throughput
- Cache hit rate
- Error rates
- Active connections

Alerts:
- High error rate (> 1%)
- Slow queries (> 1s)
- Queue backlog (> 10k jobs)
- Low cache hit rate (< 50%)
- High latency (p95 > 500ms)
```

---

## Disaster Recovery

### Backup Strategy

```
Backups:
├─ Continuous replication
├─ Daily snapshots
├─ Weekly archives
└─ Monthly long-term storage

RPO (Recovery Point Objective): < 1 hour
RTO (Recovery Time Objective): < 4 hours
```

### Failover Procedure

```
1. Detect primary failure
2. Promote read replica to primary
3. Update DNS/load balancer
4. Notify team
5. Begin investigation
6. Execute recovery plan
```

---

## Conclusion

SocialHub AI is built on modern, production-grade architecture designed for:
- **Scalability:** Handle millions of messages with auto-scaling
- **Reliability:** 99.99% uptime with redundancy
- **Security:** Enterprise-grade encryption and compliance
- **Performance:** Sub-100ms API response times
- **Maintainability:** Clean, modular architecture

The system can grow from 100 to 1,000,000+ users while maintaining performance and reliability.

---

Last Updated: January 2024
Version: 1.0.0
