import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dtos/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        const response: ResponseDto = {
          status: true,
          code: context.switchToHttp().getResponse().statusCode,
          message: 'Successful',
          data: data,
        };

        return response;
      }),
    );
  }
}
