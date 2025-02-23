import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private requestCount = 0; // Counter to track the number of requests
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip, headers } = request;

    this.logger.log({ headers });

    this.requestCount++; // Increment the request count
    const requestNumber = this.requestCount; // Get the current request number

    this.logger.log(`Request number ${requestNumber}`);

    this.logger.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} from IP ${ip}`,
    );

    return next.handle().pipe(
      tap((response: any) => {
        const httpResponse = context.switchToHttp().getResponse();
        const { statusCode } = httpResponse;

        this.logger.log(
          `[${new Date().toISOString()}] Request #${requestNumber} - ${method} ${originalUrl} - Response: ${statusCode}`,
        );
        // this.logger.log(`Response Body: ${JSON.stringify(response)}`);
        // this.logger.log(`Response Body: ${prettyjson.render(response)}`);

        this.logger.log(
          `[${new Date().toISOString()}] ${method} ${originalUrl} from ${ip} - Completed`,
        );
      }),
    );
  }
}
