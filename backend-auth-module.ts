// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MetaOAuthStrategy } from './strategies/meta-oauth.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { TokenService } from './services/token.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    MetaOAuthStrategy,
    LocalStrategy,
    EncryptionService,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}

// ============================================================================

// backend/src/modules/auth/services/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { TokenService } from './token.service';
import { CreateAuthDto } from '../dtos/create-auth.dto';
import { LoginDto } from '../dtos/login.dto';
import { User } from '../../users/entities/user.entity';
import { EncryptionService } from '../../../common/services/encryption.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private encryptionService: EncryptionService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user with email and password
   */
  async register(createAuthDto: CreateAuthDto) {
    const { email, password, firstName, lastName } = createAuthDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    // Store refresh token in database
    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
      tokenType: 'Bearer',
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Verify token is stored in database
      const storedToken = await this.tokenService.getRefreshToken(decoded.sub, refreshToken);
      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.validateUser(decoded.sub);
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Handle Meta OAuth callback
   */
  async metaOAuthCallback(profile: any) {
    let user = await this.usersService.findByOAuthProvider('meta', profile.id);

    if (!user) {
      // Create new user from OAuth profile
      user = await this.usersService.create({
        email: profile.email || `${profile.id}@meta.socialhubai.com`,
        first_name: profile.first_name || profile.name?.split(' ')[0],
        last_name: profile.last_name || profile.name?.split(' ')[1],
      });
    }

    // Store encrypted OAuth tokens
    await this.usersService.updateOAuthProvider(user.id, {
      provider: 'meta',
      provider_user_id: profile.id,
      access_token: this.encryptionService.encrypt(profile.accessToken),
      refresh_token: profile.refreshToken ? this.encryptionService.encrypt(profile.refreshToken) : null,
      token_expires_at: profile.expiresAt,
      profile_data: profile,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Logout
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.tokenService.deleteRefreshToken(userId, refreshToken);
    } else {
      await this.tokenService.deleteAllRefreshTokens(userId);
    }
    return { success: true };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password_hash: hashedPassword });

    return { success: true };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(email: string, token: string) {
    // Implement email verification logic
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.usersService.update(user.id, {
      email_verified: true,
      email_verified_at: new Date(),
    });

    return { success: true };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: 'If user exists, reset email will be sent' };
    }

    // Generate reset token (implement sending email)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    // TODO: Send reset email with token
    // await this.emailService.sendPasswordReset(user.email, resetToken);

    return { success: true, message: 'Password reset email sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'password_reset') {
        throw new BadRequestException('Invalid token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(decoded.sub, { password_hash: hashedPassword });

      return { success: true };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  /**
   * Remove sensitive information from user object
   */
  private sanitizeUser(user: User) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

// ============================================================================

// backend/src/modules/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async storeRefreshToken(userId: string, token: string) {
    const hashedToken = this.hashToken(token);
    
    return this.refreshTokenRepository.save({
      user_id: userId,
      token_hash: hashedToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  async getRefreshToken(userId: string, token: string) {
    const hashedToken = this.hashToken(token);
    
    return this.refreshTokenRepository.findOne({
      where: {
        user_id: userId,
        token_hash: hashedToken,
      },
    });
  }

  async deleteRefreshToken(userId: string, token: string) {
    const hashedToken = this.hashToken(token);
    
    return this.refreshTokenRepository.delete({
      user_id: userId,
      token_hash: hashedToken,
    });
  }

  async deleteAllRefreshTokens(userId: string) {
    return this.refreshTokenRepository.delete({ user_id: userId });
  }

  async deleteExpiredTokens() {
    return this.refreshTokenRepository.delete({
      expires_at: { $lt: new Date() },
    });
  }

  private hashToken(token: string): string {
    // Use bcrypt or similar to hash token before storing
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
