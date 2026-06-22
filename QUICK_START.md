# SocialHub AI - Quick Start Guide

## 5-Minute Setup

### Prerequisites Check
```bash
# Verify Node.js version
node -v  # Should be 18+ 

# Verify npm version
npm -v   # Should be 9+

# Verify Docker
docker --version
docker-compose --version

# Verify Git
git --version
```

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/socialhub-ai.git
cd socialhub-ai

# Install dependencies
npm install

# Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start Docker containers
docker-compose up -d

# Wait for services to be ready (check logs)
docker-compose logs -f postgres redis rabbitmq
```

### First Run

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Run database migrations
cd ../backend
npm run db:migration:run

# Start development servers
# Terminal 1: Frontend
cd ../frontend
npm run dev

# Terminal 2: Backend
cd ../backend
npm run start:dev

# Terminal 3: Background Worker
cd ../backend
npm run start:worker
```

### Access the Application

```
Frontend:         http://localhost:3000
Backend API:      http://localhost:3001
API Docs:         http://localhost:3001/api/docs
PgAdmin:          http://localhost:5050
RabbitMQ:         http://localhost:15672
Minio S3:         http://localhost:9001
```

---

## Project Structure

```
socialhub-ai/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Tailwind CSS
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
│
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── common/          # Shared utilities
│   │   ├── config/          # Configuration
│   │   ├── database/        # Migrations
│   │   └── main.ts          # Entry point
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── workers/                 # Background job processors
│   ├── webhooks/           # Webhook handler
│   ├── ai/                 # AI inference worker
│   └── scheduler/          # Scheduled tasks
│
├── database/               # Database setup
│   └── migrations/         # SQL migrations
│
├── docs/                   # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
│
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production setup
├── .env.example            # Environment template
└── README.md               # Project overview
```

---

## Environment Configuration

### Backend (.env)

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=socialhub_ai_dev
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Meta API
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_VERIFY_TOKEN=your_verify_token

# OpenAI
OPENAI_API_KEY=sk_your_openai_api_key
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_META_APP_ID=your_meta_app_id

# Features
NEXT_PUBLIC_FEATURE_AI_REPLIES=true
NEXT_PUBLIC_FEATURE_AUTOMATION_BUILDER=true
```

---

## Common Development Tasks

### Database Operations

```bash
# Create a new migration
cd backend
npm run typeorm migration:generate src/database/migrations/AddNewTable

# Run migrations
npm run db:migration:run

# Revert last migration
npm run db:migration:revert

# Reset database (WARNING: loses all data)
npm run db:reset

# Seed test data
npm run db:seed

# Connect to database CLI
docker exec -it socialhub-postgres psql -U postgres -d socialhub_ai_dev
```

### API Development

```bash
# View API documentation
open http://localhost:3001/api/docs

# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/workspaces

# Test with authentication
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Frontend Development

```bash
# Hot reload changes
npm run dev

# Build for production
npm run build

# Test production build locally
npm run build && npm run start

# Analyze bundle size
npm run analyze

# Type checking
npm run type-check
```

### Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:watch
npm run test:cov

# Frontend tests
cd frontend
npm run test
npm run test:watch

# E2E tests
npm run test:e2e
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format with Prettier
npm run format
```

### Docker Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f postgres

# Access container shell
docker exec -it socialhub-backend sh
docker exec -it socialhub-postgres bash

# Restart services
docker-compose restart backend

# Stop all services
docker-compose stop

# Remove all containers and volumes
docker-compose down -v
```

---

## Development Workflow

### 1. Create a Feature

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes in both frontend and backend as needed

# Test your changes
npm run test

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push branch
git push origin feature/amazing-feature

# Create Pull Request on GitHub
```

### 2. Frontend Development Example

```typescript
// components/MessageList.tsx
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';

export function MessageList({ conversationId }: Props) {
  const { messages, isLoading, error } = useMessages(conversationId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className="p-4 bg-slate-100 rounded">
          {msg.content}
        </div>
      ))}
    </div>
  );
}
```

### 3. Backend Development Example

```typescript
// modules/messages/messages.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':id')
  async getMessage(@Param('id') id: string) {
    return this.messagesService.findById(id);
  }

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different ports
PORT=3002 npm run dev
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps postgres

# Check database credentials in .env
cat backend/.env | grep DATABASE

# Try connecting directly
docker exec -it socialhub-postgres psql -U postgres
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Check Redis connection
redis-cli ping  # Should return PONG

# Monitor Redis commands
redis-cli monitor
```

### Node Modules Issues

```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Clear npm cache
npm cache clean --force
```

### Docker Issues

```bash
# Check Docker daemon
docker ps

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Remove all Docker artifacts
docker-compose down -v
docker system prune -a
```

---

## Git Workflow

### Commit Message Convention

```
feat:  A new feature
fix:   A bug fix
docs:  Documentation only changes
style: Changes that don't affect code meaning
refactor: Code change that neither fixes bugs nor adds features
perf:  Code change that improves performance
test:  Adding or updating tests
chore: Changes to build process or dependencies
```

### Branch Naming

```
feature/user-authentication
bugfix/message-not-sending
docs/api-documentation
refactor/database-queries
```

### Pull Request Process

```
1. Create feature branch from main
2. Make commits with conventional messages
3. Push to origin
4. Create PR with description
5. Wait for CI to pass
6. Code review
7. Merge to main
8. Delete feature branch
```

---

## Performance Tips

### Frontend

```typescript
// Use React.memo for expensive components
export const MessageItem = React.memo(({ message }: Props) => {
  return <div>{message.content}</div>;
});

// Use useCallback for event handlers
const handleSendMessage = useCallback((text: string) => {
  dispatch(sendMessage(text));
}, [dispatch]);

// Lazy load routes
const DashboardPage = lazy(() => import('./pages/dashboard'));

// Use virtual scrolling for long lists
import { FixedSizeList } from 'react-window';
```

### Backend

```typescript
// Use pagination
@Get()
async getMessages(@Query() pagination: PaginationDto) {
  return this.messagesService.paginate(pagination);
}

// Add database indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

// Cache frequently accessed data
@Cacheable()
async getConversation(id: string) {
  return this.conversationsService.findById(id);
}

// Use batch queries
const messages = await getRepository(Message)
  .createQueryBuilder('m')
  .whereInIds([...messageIds])
  .getMany();
```

---

## Security Best Practices

### Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use different keys for development and production
```

### API Security
```typescript
// Validate user input
@Post()
@UseGuards(AuthGuard('jwt'))
async create(@Body() createDto: CreateMessageDto) {
  // Input is automatically validated
  return this.service.create(createDto);
}

// Rate limiting
@UseGuards(ThrottleGuard)
@Throttle(100, 900) // 100 requests per 15 minutes
async sendMessage(@Body() dto: SendMessageDto) {
  return this.service.send(dto);
}
```

### Database Security
```typescript
// Use parameterized queries (TypeORM does this automatically)
const user = await userRepository.findOne({
  where: { email: userEmail } // Parameterized
});

// Never expose sensitive data
const user = await userRepository.findOne(id);
const { password_hash, ...safeUser } = user;
return safeUser;
```

---

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [RabbitMQ Guide](https://www.rabbitmq.com/getstarted.html)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [OpenAI API](https://platform.openai.com/docs)

---

## Support & Help

### Getting Help

```bash
# View logs
docker-compose logs -f <service>

# Check service health
docker-compose ps

# Run diagnostics
npm run lint
npm run type-check
npm run test
```

### Reporting Issues

1. Check existing GitHub issues
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (Node version, OS, etc.)
   - Logs/screenshots

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request
5. Follow code style guide
6. Ensure tests pass

---

## Next Steps

1. ✅ Complete basic setup
2. 📚 Read [API Documentation](./API_DOCUMENTATION.md)
3. 🏗️ Review [System Architecture](./SYSTEM_ARCHITECTURE.md)
4. 🚀 Deploy to [Production](./DEPLOYMENT_GUIDE.md)
5. 📊 Set up [Monitoring](./DEPLOYMENT_GUIDE.md#monitoring--observability)
6. 🔐 Configure [Security](./SYSTEM_ARCHITECTURE.md#security-architecture)

---

**Happy coding! 🚀**

Last Updated: January 2024
Version: 1.0.0
