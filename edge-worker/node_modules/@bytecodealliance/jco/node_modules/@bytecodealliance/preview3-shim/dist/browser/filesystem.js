import { _getPreopens as getPreview2Preopens, createFilesystem as createPreview2Filesystem, } from "@bytecodealliance/preview2-shim/filesystem";
import types, { wrapDescriptor } from "./filesystem/types.js";
export { default as preopens } from "./filesystem/preopens.js";
export { default as types } from "./filesystem/types.js";
export { _addPreopen, _addPreopenWithAdapter, _clearPreopens, _getFileData, _setCwd, _setFileData, _setPreopens, InMemoryFilesystemAdapter, loadOpfsCapability, OpfsFilesystemAdapter, } from "@bytecodealliance/preview2-shim/filesystem";
export function _getPreopens() {
    return getPreview2Preopens().map(([descriptor, path]) => [wrapDescriptor(descriptor), path]);
}
export function createFilesystem(config) {
    const filesystem = createPreview2Filesystem(config);
    return {
        types,
        preopens: {
            getDirectories() {
                return filesystem.preopens
                    .getDirectories()
                    .map(([descriptor, path]) => [wrapDescriptor(descriptor), path]);
            },
        },
        dispose: filesystem.dispose,
    };
}
