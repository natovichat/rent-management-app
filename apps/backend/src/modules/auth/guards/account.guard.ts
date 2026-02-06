import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtStrategy

    // Attach accountId to request for easy access
    if (user && user.accountId) {
      request.accountId = user.accountId;
      return true;
    }

    return false;
  }
}
