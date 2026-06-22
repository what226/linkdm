# SocialHub AI - API Documentation

## Base URL

```
Development:  http://localhost:3001
Production:   https://api.socialhubai.com
API Version:  v1
```

## Authentication

All API endpoints (except auth) require Bearer token authentication:

```bash
Authorization: Bearer {access_token}
```

## Rate Limiting

- **Default:** 100 requests per 15 minutes per API key
- **Enterprise:** Unlimited (available on request)
- Rate limit headers:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Authentication Endpoints

### 1. Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h",
    "tokenType": "Bearer"
  }
}
```

### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### 3. Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Meta OAuth Callback

```http
GET /api/v1/auth/meta/callback?code={auth_code}&state={state}
```

### 5. Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {access_token}

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 6. Change Password

```http
POST /api/v1/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

## Users Endpoints

### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://...",
  "timezone": "UTC",
  "language": "en",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update Profile

```http
PUT /api/v1/users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "timezone": "America/New_York",
  "language": "en"
}
```

### Get User Settings

```http
GET /api/v1/users/me/settings
Authorization: Bearer {access_token}
```

### Update User Settings

```http
PUT /api/v1/users/me/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true,
  "darkMode": true
}
```

---

## Workspaces Endpoints

### List Workspaces

```http
GET /api/v1/workspaces
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (default: createdAt)
- `order`: asc or desc

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Business",
      "slug": "my-business",
      "ownerId": "uuid",
      "description": "My business workspace",
      "logoUrl": "https://...",
      "members": 3,
      "connectedAccounts": 2,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Create Workspace

```http
POST /api/v1/workspaces
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "My Business",
  "slug": "my-business",
  "description": "My business workspace",
  "timezone": "UTC"
}
```

### Get Workspace

```http
GET /api/v1/workspaces/{workspaceId}
Authorization: Bearer {access_token}
```

### Update Workspace

```http
PUT /api/v1/workspaces/{workspaceId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Workspace

```http
DELETE /api/v1/workspaces/{workspaceId}
Authorization: Bearer {access_token}
```

### List Workspace Members

```http
GET /api/v1/workspaces/{workspaceId}/members
Authorization: Bearer {access_token}
```

### Add Workspace Member

```http
POST /api/v1/workspaces/{workspaceId}/members
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "member@example.com",
  "role": "agent" // owner, admin, agent
}
```

### Update Member Role

```http
PUT /api/v1/workspaces/{workspaceId}/members/{memberId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "admin"
}
```

### Remove Member

```http
DELETE /api/v1/workspaces/{workspaceId}/members/{memberId}
Authorization: Bearer {access_token}
```

---

## Social Accounts Endpoints

### Connect Facebook Page

```http
POST /api/v1/workspaces/{workspaceId}/social-accounts/facebook
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accessToken": "EAAC...",
  "pageId": "123456789",
  "pageName": "My Business Page"
}
```

### Connect Instagram Account

```http
POST /api/v1/workspaces/{workspaceId}/social-accounts/instagram
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accessToken": "IGQV...",
  "instagramBusinessAccountId": "123456789"
}
```

### List Connected Accounts

```http
GET /api/v1/workspaces/{workspaceId}/social-accounts
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "accountType": "instagram",
      "username": "@myaccount",
      "displayName": "My Account",
      "profilePictureUrl": "https://...",
      "followerCount": 5000,
      "isVerified": true,
      "tokenHealthStatus": "healthy",
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ]
}
```

### Get Social Account Details

```http
GET /api/v1/workspaces/{workspaceId}/social-accounts/{accountId}
Authorization: Bearer {access_token}
```

### Disconnect Social Account

```http
DELETE /api/v1/workspaces/{workspaceId}/social-accounts/{accountId}
Authorization: Bearer {access_token}
```

### Refresh Token

```http
POST /api/v1/workspaces/{workspaceId}/social-accounts/{accountId}/refresh-token
Authorization: Bearer {access_token}
```

### Sync Account Data

```http
POST /api/v1/workspaces/{workspaceId}/social-accounts/{accountId}/sync
Authorization: Bearer {access_token}
```

---

## Conversations & Messages

### List Conversations

```http
GET /api/v1/workspaces/{workspaceId}/conversations
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: open, closed, archived, spam
- `search`: Search in participant name
- `assignedTo`: Filter by assigned user
- `sort`: Field to sort by
- `order`: asc or desc

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "conversationType": "dm",
      "participantName": "John User",
      "participantPictureUrl": "https://...",
      "lastMessage": "Hi, I need help...",
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "messageCount": 15,
      "unreadCount": 3,
      "status": "open",
      "sentiment": "neutral",
      "leadStatus": "new",
      "assignedTo": "uuid",
      "tags": ["vip", "support"]
    }
  ],
  "pagination": { ... }
}
```

### Get Conversation Details

```http
GET /api/v1/workspaces/{workspaceId}/conversations/{conversationId}
Authorization: Bearer {access_token}
```

### Update Conversation Status

```http
PUT /api/v1/workspaces/{workspaceId}/conversations/{conversationId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "closed",
  "tags": ["vip", "resolved"],
  "assignedToUserId": "uuid"
}
```

### List Messages in Conversation

```http
GET /api/v1/workspaces/{workspaceId}/conversations/{conversationId}/messages
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sort`: createdAt (default)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Hello, I'm interested in your product",
      "senderName": "John User",
      "senderPictureUrl": "https://...",
      "isFromUs": false,
      "messageType": "text",
      "sentiment": "positive",
      "linkUrls": ["https://example.com"],
      "status": "delivered",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Send Message

```http
POST /api/v1/workspaces/{workspaceId}/conversations/{conversationId}/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "Thank you for your interest!",
  "messageType": "text"
}
```

### Send AI-Generated Reply

```http
POST /api/v1/workspaces/{workspaceId}/conversations/{conversationId}/ai-reply
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "aiPromptId": "uuid",
  "context": "Previous message context"
}
```

### Mark Messages as Read

```http
PUT /api/v1/workspaces/{workspaceId}/conversations/{conversationId}/read
Authorization: Bearer {access_token}
```

---

## Comments Endpoints

### List Comments

```http
GET /api/v1/workspaces/{workspaceId}/comments
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `accountId`: Filter by social account
- `postId`: Filter by post ID
- `postType`: post, reel, story
- `status`: replied, pending

### Get Comment Details

```http
GET /api/v1/workspaces/{workspaceId}/comments/{commentId}
Authorization: Bearer {access_token}
```

### Reply to Comment

```http
POST /api/v1/workspaces/{workspaceId}/comments/{commentId}/reply
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "commentText": "Thank you for your feedback!",
  "sendDM": true,
  "dmText": "Thanks for your interest, checking out your DM!"
}
```

### Generate AI Comment Reply

```http
POST /api/v1/workspaces/{workspaceId}/comments/{commentId}/ai-reply
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "aiPromptId": "uuid"
}
```

---

## Automation Flows

### List Automation Flows

```http
GET /api/v1/workspaces/{workspaceId}/automation-flows
Authorization: Bearer {access_token}
```

### Create Automation Flow

```http
POST /api/v1/workspaces/{workspaceId}/automation-flows
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Comment to DM Flow",
  "description": "Send DM when someone comments with keyword",
  "flowType": "comment_dm",
  "triggerType": "keyword",
  "triggerKeywords": ["buy", "interested", "price"],
  "accountIds": ["uuid-1", "uuid-2"],
  "automationEnabled": true
}
```

### Get Automation Flow

```http
GET /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}
Authorization: Bearer {access_token}
```

### Update Automation Flow

```http
PUT /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Flow Name",
  "automationEnabled": true
}
```

### Delete Automation Flow

```http
DELETE /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}
Authorization: Bearer {access_token}
```

### List Automation Steps

```http
GET /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}/steps
Authorization: Bearer {access_token}
```

### Add Automation Step

```http
POST /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}/steps
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "stepOrder": 1,
  "stepType": "send_dm",
  "actionType": "send_message",
  "messageContent": "Thanks for your interest!",
  "delaySecs": 0
}
```

### Execute Automation Flow

```http
POST /api/v1/workspaces/{workspaceId}/automation-flows/{flowId}/execute
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "triggerData": {
    "commentText": "This looks great!",
    "commenterId": "123456789"
  }
}
```

---

## AI & Content

### List AI Prompts

```http
GET /api/v1/workspaces/{workspaceId}/ai-prompts
Authorization: Bearer {access_token}
```

### Create AI Prompt

```http
POST /api/v1/workspaces/{workspaceId}/ai-prompts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Friendly DM Response",
  "promptType": "dm_reply",
  "systemPrompt": "You are a friendly customer service representative...",
  "userPromptTemplate": "User message: {message}",
  "model": "gpt-4-turbo",
  "temperature": 0.7
}
```

### Generate AI Reply

```http
POST /api/v1/workspaces/{workspaceId}/ai-replies/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "aiPromptId": "uuid",
  "sourceType": "message",
  "originalContent": "How much does this cost?",
  "context": "Customer is interested in pricing"
}
```

**Response:**
```json
{
  "id": "uuid",
  "aiGeneratedReply": "Great question! Our pricing starts at $99/month...",
  "confidenceScore": 0.92,
  "sentiment": "positive"
}
```

### List Brand Voices

```http
GET /api/v1/workspaces/{workspaceId}/brand-voices
Authorization: Bearer {access_token}
```

### Create Brand Voice

```http
POST /api/v1/workspaces/{workspaceId}/brand-voices
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Professional Tone",
  "description": "Professional and helpful",
  "tone": "professional",
  "styleGuidelines": "Use clear language, be concise...",
  "emojiUsage": "minimal"
}
```

---

## Analytics

### Get Dashboard Analytics

```http
GET /api/v1/workspaces/{workspaceId}/analytics/dashboard
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `dateFrom`: Start date (ISO 8601)
- `dateTo`: End date (ISO 8601)
- `accountId`: Filter by social account

**Response:**
```json
{
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-01-31"
  },
  "metrics": {
    "messagesReceived": 2458,
    "messagesSent": 1847,
    "commentsReceived": 892,
    "commentsReplied": 756,
    "automationTriggered": 450,
    "automationSuccess": 423,
    "linkClicks": 234,
    "engagementRate": 24.5
  },
  "trends": {
    "messagesReceived": "+12%",
    "engagement": "+3.2%"
  }
}
```

### Get Conversation Analytics

```http
GET /api/v1/workspaces/{workspaceId}/analytics/conversations
Authorization: Bearer {access_token}
```

### Get Daily Analytics

```http
GET /api/v1/workspaces/{workspaceId}/analytics/daily
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `dateFrom`: Start date
- `dateTo`: End date
- `granularity`: day, week, month

### Export Analytics Report

```http
POST /api/v1/workspaces/{workspaceId}/analytics/export
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "format": "csv", // csv, pdf, xlsx
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "includeMetrics": ["all"]
}
```

---

## Leads Management

### List Leads

```http
GET /api/v1/workspaces/{workspaceId}/leads
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status`: new, contacted, qualified
- `source`: instagram, facebook, comment, dm
- `tags`: Array of tags to filter

### Create Lead

```http
POST /api/v1/workspaces/{workspaceId}/leads
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "instagram",
  "leadStatus": "new"
}
```

### Update Lead

```http
PUT /api/v1/workspaces/{workspaceId}/leads/{leadId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "leadStatus": "qualified",
  "leadScore": 85,
  "tags": ["vip", "high-intent"]
}
```

### Log Lead Interaction

```http
POST /api/v1/workspaces/{workspaceId}/leads/{leadId}/interactions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "interactionType": "message",
  "interactionContent": "Sent demo access"
}
```

---

## Billing & Subscriptions

### Get Subscription

```http
GET /api/v1/workspaces/{workspaceId}/subscription
Authorization: Bearer {access_token}
```

### List Plans

```http
GET /api/v1/billing/plans
Authorization: Bearer {access_token}
```

### Upgrade Plan

```http
POST /api/v1/workspaces/{workspaceId}/subscription/upgrade
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "planId": "uuid"
}
```

### Cancel Subscription

```http
POST /api/v1/workspaces/{workspaceId}/subscription/cancel
Authorization: Bearer {access_token}
```

### Get Invoices

```http
GET /api/v1/workspaces/{workspaceId}/invoices
Authorization: Bearer {access_token}
```

### Get Invoice PDF

```http
GET /api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/pdf
Authorization: Bearer {access_token}
```

---

## Webhooks

### List Webhooks

```http
GET /api/v1/workspaces/{workspaceId}/webhooks
Authorization: Bearer {access_token}
```

### Create Webhook Subscription

```http
POST /api/v1/workspaces/{workspaceId}/webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "url": "https://yourserver.com/webhook",
  "events": ["message.received", "comment.created"],
  "active": true
}
```

### Get Webhook Details

```http
GET /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
Authorization: Bearer {access_token}
```

### Update Webhook

```http
PUT /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "events": ["message.received", "message.sent"],
  "active": true
}
```

### Delete Webhook

```http
DELETE /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
Authorization: Bearer {access_token}
```

### Test Webhook

```http
POST /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/test
Authorization: Bearer {access_token}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email is invalid"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |

---

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /api/v1/workspaces?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Webhooks Events

### Message Received
```json
{
  "event": "message.received",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "messageId": "uuid",
    "conversationId": "uuid",
    "content": "Hey, how are you?",
    "senderName": "John",
    "accountId": "uuid"
  }
}
```

### Comment Created
```json
{
  "event": "comment.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "commentId": "uuid",
    "postId": "instagram_post_id",
    "commentText": "Love this!",
    "commenterName": "Jane",
    "accountId": "uuid"
  }
}
```

### Automation Executed
```json
{
  "event": "automation.executed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "automationId": "uuid",
    "status": "success",
    "executionId": "uuid",
    "messagesSet": 1
  }
}
```

---

## Rate Limiting

Rate limits reset every 15 minutes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1705330800
```

When rate limited, you'll receive a 429 response:

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "retryAfter": 34
}
```

---

## SDKs & Libraries

- **JavaScript/TypeScript:** `npm install @socialhubai/sdk`
- **Python:** `pip install socialhubai-sdk`
- **PHP:** `composer require socialhubai/sdk`
- **Go:** `go get github.com/socialhubai/sdk-go`

---

Last Updated: January 2024
Version: 1.0.0
