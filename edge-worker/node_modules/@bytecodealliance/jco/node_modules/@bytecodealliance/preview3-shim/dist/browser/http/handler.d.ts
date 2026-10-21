import type { Request, Response } from "../../../types/interfaces/wasi-http-handler.d.ts";
type Handler = {
    handle(request: Request): Promise<Response> | Response;
};
declare function handle(request: Request): Promise<Response>;
export declare function _setHandler(handler: Handler | undefined): Handler | undefined;
declare const _default: {
    handle: typeof handle;
};
export default _default;
export type * from "../../../types/interfaces/wasi-http-handler.d.ts";
