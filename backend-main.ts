// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const port = configService.get('PORT', 3001);
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3000').split(',');

  // Security Middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
    maxAge: 3600,
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
  );

  // Swagger Documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SocialHub AI API')
      .setDescription('The SocialHub AI Platform API documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'api_key', in: 'header' }, 'api_key')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Health Check
  app.get('health', () => ({ status: 'ok', timestamp: new Date() }));

  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 SocialHub AI API running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${nodeEnv}\n`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// ============================================================================

// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthCheckController } from './common/controllers/health-check.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
        PORT: Joi.number().default(3001),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        META_APP_ID: Joi.string().required(),
        META_APP_SECRET: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      logging: process.env.LOG_LEVEL === 'debug',
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
      migrationsRun: false,
      ssl: process.env.DATABASE_SSL === 'true',
      extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    }),

    // Redis Cache
    RedisModule.forRoot({
      closeClient: true,
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute default
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    WorkspacesModule,
    SocialAccountsModule,
    ConversationsModule,
    MessagesModule,
    CommentsModule,
    AutomationModule,
    AiModule,
    AnalyticsModule,
    WebhooksModule,
    LeadsModule,
    BillingModule,
    NotificationsModule,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}

// ============================================================================

// backend/src/common/controllers/health-check.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthCheckController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  live() {
    return { status: 'alive' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  ready() {
    return { status: 'ready' };
  }
}
