import type { Request as RequestT, Response as ResponseT } from "../../../types/interfaces/wasi-http-types.d.ts";
declare function send(request: RequestT): Promise<ResponseT>;
declare const _default: {
    send: typeof send;
};
export default _default;
export type * from "../../../types/interfaces/wasi-http-client.d.ts";
