import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class UppercaseInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map(data => (typeof data === 'string' ? data.toLocaleUpperCase() : data)))
    }
}