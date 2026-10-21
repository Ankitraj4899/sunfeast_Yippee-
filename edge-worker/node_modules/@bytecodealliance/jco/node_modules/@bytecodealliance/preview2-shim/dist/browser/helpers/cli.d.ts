import { type InputStreamHandler } from "../io.js";
/**
 * Build an `InputStreamHandler` that serves a fixed buffer, then reports `closed`.
 *
 * Pass the result to `createCli({ stdin })` or `_setStdin` to feed a guest a fixed stdin.
 */
export declare function bufferedInputStream(input: Uint8Array | string): InputStreamHandler;
