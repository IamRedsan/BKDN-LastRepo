import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import googleOauthConfig from 'src/config/google-oauth.config';
import { AuthService } from '../../modules/auth/auth.service';
import { GoogleProfile } from '../interfaces/google-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleOauthConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleOauthConfiguration.clientID!,
      clientSecret: googleOauthConfiguration.clientSecret!,
      callbackURL: googleOauthConfiguration.callbackURL!,
      scope: ['email', 'profile'],
      prompt: 'select_account',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;
    try {
      const user = await this.authService.validateGoogleUser(id, displayName, email);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
