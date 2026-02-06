import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Development authentication guard that bypasses JWT validation
 * and uses X-Account-Id header for testing.
 * 
 * WARNING: Only use in development! Never deploy to production!
 */
@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Check if X-Account-Id header is present (dev mode)
    const accountId = request.headers['x-account-id'];
    
    if (accountId) {
      // Inject a fake user object into the request
      request.user = {
        sub: accountId,
        accountId: accountId,
        email: 'dev@test.com',
      };
      
      console.log('🔧 DEV MODE: Bypassing auth, using account:', accountId);
      return true;
    }
    
    // If no dev header, deny access
    return false;
  }
}
