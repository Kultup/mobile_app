import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Use IP address as tracker
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  protected throwThrottlingException(context: ExecutionContext): void {
    throw new ThrottlerException('Too many requests, please try again later');
  }
}

