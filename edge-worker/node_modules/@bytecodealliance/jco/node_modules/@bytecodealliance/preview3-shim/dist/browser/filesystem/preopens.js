import { preopens } from "@bytecodealliance/preview2-shim/filesystem";
import { wrapDescriptor } from "./types.js";
function getDirectories() {
    return preopens.getDirectories().map(([descriptor, path]) => [wrapDescriptor(descriptor), path]);
}
export default {
    getDirectories,
};
