import { types as preview2Types } from "@bytecodealliance/preview2-shim/http";
import type { Fields as FieldsT, Request as RequestT, RequestOptions as RequestOptionsT, Response as ResponseT, FieldName, FieldValue, Headers, Method, Scheme, Duration, StatusCode, Trailers, HeaderError, ErrorCode, Result } from "../../../types/interfaces/wasi-http-types.d.ts";
type Preview2Fields = InstanceType<typeof preview2Types.Fields>;
export declare class HttpError extends Error {
    readonly payload: HeaderError;
    constructor(payload: HeaderError, message?: string);
}
export declare const _forbiddenHeaders: {
    value: Set<string>;
};
export declare class Fields implements FieldsT {
    #private;
    readonly _preview2: Preview2Fields;
    constructor(fields?: import("@bytecodealliance/preview2-shim/interfaces/wasi-http-types").Fields);
    static fromList(entries: Array<[FieldName, FieldValue]>): Fields;
    get(name: FieldName): Array<FieldValue>;
    has(name: FieldName): boolean;
    set(name: FieldName, value: Array<FieldValue>): void;
    delete(name: FieldName): void;
    getAndDelete(name: FieldName): Array<FieldValue>;
    append(name: FieldName, value: FieldValue): void;
    copyAll(): Array<[FieldName, FieldValue]>;
    clone(): Fields;
    static _lock(fields: Fields): Fields;
}
export declare class RequestOptions implements RequestOptionsT {
    #private;
    getConnectTimeout(): Duration | undefined;
    setConnectTimeout(duration: Duration | undefined): void;
    getFirstByteTimeout(): Duration | undefined;
    setFirstByteTimeout(duration: Duration | undefined): void;
    getBetweenBytesTimeout(): Duration | undefined;
    setBetweenBytesTimeout(duration: Duration | undefined): void;
    clone(): RequestOptions;
    static _lock(options: RequestOptions | undefined): RequestOptions | undefined;
}
type TransmissionResult = Result<void, ErrorCode>;
type TrailersResult = Result<Trailers | undefined, ErrorCode>;
export declare class Request implements RequestT {
    #private;
    static new(headers: Headers, contents: ReadableStream<number> | undefined, trailers: Promise<TrailersResult>, options: RequestOptions | undefined): [Request, Promise<TransmissionResult>];
    getMethod(): Method;
    setMethod(method: Method): void;
    getPathWithQuery(): string | undefined;
    setPathWithQuery(pathWithQuery: string | undefined): void;
    getScheme(): Scheme | undefined;
    setScheme(scheme: Scheme | undefined): void;
    getAuthority(): string | undefined;
    setAuthority(authority: string | undefined): void;
    getOptions(): RequestOptions | undefined;
    getHeaders(): Fields;
    static consumeBody(this_: Request, res: Promise<TransmissionResult>): [ReadableStream<number>, Promise<TrailersResult>];
    _body(): ReadableStream<number> | undefined;
    _trailers(): Promise<TrailersResult>;
    _resolve(result: TransmissionResult): void;
}
export declare class Response implements ResponseT {
    #private;
    static new(headers: Headers, contents: ReadableStream<number> | undefined, trailers: Promise<TrailersResult>): [Response, Promise<TransmissionResult>];
    getStatusCode(): StatusCode;
    setStatusCode(statusCode: StatusCode): void;
    getHeaders(): Fields;
    static consumeBody(this_: Response, res: Promise<TransmissionResult>): [ReadableStream<number>, Promise<TrailersResult>];
}
declare const _default: {
    Fields: typeof Fields;
    Request: typeof Request;
    RequestOptions: typeof RequestOptions;
    Response: typeof Response;
};
export default _default;
export type * from "../../../types/interfaces/wasi-http-types.d.ts";
