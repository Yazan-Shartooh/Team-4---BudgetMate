import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let messages = ['Something went wrong. Please try again.'];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        messages = [body];
        error = exception.name;
      } else if (body && typeof body === 'object') {
        const bodyRecord = body as Record<string, unknown>;
        if (typeof bodyRecord.error === 'string') error = bodyRecord.error;
        if (Array.isArray(bodyRecord.message)) {
          messages = bodyRecord.message.map(String);
        } else if (typeof bodyRecord.message === 'string') {
          messages = [bodyRecord.message];
        }
      }
    } else {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url} failed unexpectedly`,
        stack,
      );
    }

    const body: ErrorResponseBody = {
      statusCode,
      error,
      message: messages.length > 0 ? messages : ['Request failed.'],
    };

    response.status(statusCode).json(body);
  }
}
