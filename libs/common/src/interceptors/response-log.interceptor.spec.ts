import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom, Observable } from 'rxjs';
import { ResponseLoggingInterceptor } from './response-log.interceptor';

describe('ResponseLoggingInterceptor', () => {
    let interceptor: ResponseLoggingInterceptor;
    let consoleLogSpy: jest.SpyInstance;

    const createMockExecutionContext = (url = '/users'): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ url }),
            }),
        } as unknown as ExecutionContext;
    };

    const createMockCallHandler = (returnValue: any): CallHandler => ({
        handle: () => of(returnValue),
    });

    beforeEach(() => {
        interceptor = new ResponseLoggingInterceptor();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should wrap successful data in a success envelope', async () => {
        const context = createMockExecutionContext();
        const handler = createMockCallHandler({ id: 1, firstName: 'Kitoko' });

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ id: 1, firstName: 'Kitoko' });
        expect(result.timestamp).toBeDefined();
    });

    it('should mark success as false when data is null', async () => {
        const context = createMockExecutionContext();
        const handler = createMockCallHandler(null);

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
    });

    it('should mark success as false when data is an Error instance', async () => {
        const context = createMockExecutionContext();
        const error = new Error('something went wrong');
        const handler = createMockCallHandler(error);

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        expect(result.success).toBe(false);
        expect(result.data).toBe(error);
    });

    it('should mark success as true for an empty array', async () => {
        const context = createMockExecutionContext();
        const handler = createMockCallHandler([]);

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        // [] is truthy and not an Error, so success should be true
        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
    });

    it('should include a valid ISO timestamp', async () => {
        const context = createMockExecutionContext();
        const handler = createMockCallHandler({ ok: true });

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
        expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should log the request URL and execution time', async () => {
        const context = createMockExecutionContext('/v1/users');
        const handler = createMockCallHandler({ ok: true });

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        await lastValueFrom(result$);

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringMatching(/^Request to \/v1\/users took \d+ms$/),
        );
    });

    it('should preserve the original data structure inside the data field', async () => {
        const context = createMockExecutionContext();
        const payload = [{ id: 1 }, { id: 2 }];
        const handler = createMockCallHandler(payload);

        const result$ = interceptor.intercept(context, handler) as Observable<any>;
        const result = await lastValueFrom(result$);

        expect(result.data).toEqual(payload);
        expect(result.data).toHaveLength(2);
    });
});
