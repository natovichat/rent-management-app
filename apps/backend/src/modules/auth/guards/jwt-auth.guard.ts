import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // DEVELOPMENT MODE: Check for X-Account-Id header
    const request = context.switchToHttp().getRequest();
    const accountId = request.headers['x-account-id'];
    
    if (accountId) {
      // Inject a fake user object for development
      request.user = {
        sub: accountId,
        accountId: accountId,
        email: 'dev@test.com',
      };
      console.log('🔧 DEV MODE: Bypassing JWT auth, using account:', accountId);
      return true;
    }

    return super.canActivate(context);
  }
}
