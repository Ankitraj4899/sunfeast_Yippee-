import { type WriteFileAtOptions } from "../../common/helpers/filesystem.js";
export type { WriteFileAtOptions };
/** Write bytes into a preopened directory's tree from host JS, without a guest. */
export declare function writeFileAt(virtualPath: string, path: string, data: Uint8Array, options?: WriteFileAtOptions): void;
/** Read the full contents of a file under a preopened directory from host JS, without a guest. */
export declare function readFileAt(virtualPath: string, path: string): Uint8Array;
