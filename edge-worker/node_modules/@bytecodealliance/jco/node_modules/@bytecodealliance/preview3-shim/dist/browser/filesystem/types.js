import { readableFromPreview2Input, writeToPreview2Output } from "../streams.js";
const symbolDispose = Symbol.dispose ?? Symbol.for("dispose");
const TYPE_TAGS = new Set([
    "block-device",
    "character-device",
    "directory",
    "fifo",
    "symbolic-link",
    "regular-file",
    "socket",
]);
function descriptorType(type) {
    if (TYPE_TAGS.has(type)) {
        return { tag: type };
    }
    return { tag: "other", val: type === "unknown" ? undefined : type };
}
export function filesystemErrorCode(error) {
    let tag = typeof error === "string" ? error : error?.tag;
    if (!tag && error instanceof Error) {
        tag = error.message;
    }
    if (tag === "would-block") {
        return { tag: "other", val: tag };
    }
    if (tag) {
        return { tag };
    }
    return { tag: "other", val: String(error) };
}
class FilesystemError extends Error {
    payload;
    constructor(error) {
        const payload = filesystemErrorCode(error);
        super(payload.tag);
        this.name = "FilesystemError";
        this.payload = payload;
    }
}
function filesystemCall(operation) {
    try {
        return operation();
    }
    catch (error) {
        throw error instanceof FilesystemError ? error : new FilesystemError(error);
    }
}
function stat(value) {
    return { ...value, type: descriptorType(value.type) };
}
export class Descriptor {
    #descriptor;
    static _wrap(descriptor) {
        const wrapped = new Descriptor();
        wrapped.#descriptor = descriptor;
        return wrapped;
    }
    readViaStream(offset) {
        return readableFromPreview2Input(this.#descriptor.readViaStream(offset), filesystemErrorCode);
    }
    async writeViaStream(data, offset) {
        try {
            await writeToPreview2Output(data, this.#descriptor.writeViaStream(offset));
            return { tag: "ok", val: undefined };
        }
        catch (error) {
            return { tag: "err", val: filesystemErrorCode(error) };
        }
    }
    async appendViaStream(data) {
        try {
            await writeToPreview2Output(data, this.#descriptor.appendViaStream());
            return { tag: "ok", val: undefined };
        }
        catch (error) {
            return { tag: "err", val: filesystemErrorCode(error) };
        }
    }
    async advise(offset, length, advice) {
        filesystemCall(() => this.#descriptor.advise(offset, length, advice));
    }
    async syncData() {
        filesystemCall(() => this.#descriptor.syncData());
    }
    async getFlags() {
        return filesystemCall(() => this.#descriptor.getFlags());
    }
    async getType() {
        return descriptorType(filesystemCall(() => this.#descriptor.getType()));
    }
    async setSize(size) {
        filesystemCall(() => this.#descriptor.setSize(size));
    }
    async setTimes(dataAccessTimestamp, dataModificationTimestamp) {
        filesystemCall(() => this.#descriptor.setTimes(dataAccessTimestamp, dataModificationTimestamp));
    }
    readDirectory() {
        const directory = this.#descriptor.readDirectory();
        const stream = new ReadableStream({
            pull(controller) {
                try {
                    const entry = directory.readDirectoryEntry();
                    if (!entry) {
                        controller.close();
                        return;
                    }
                    controller.enqueue({ ...entry, type: descriptorType(entry.type) });
                }
                catch (error) {
                    controller.error(error);
                }
            },
        });
        return [stream, Promise.resolve({ tag: "ok", val: undefined })];
    }
    async sync() {
        filesystemCall(() => this.#descriptor.sync());
    }
    async createDirectoryAt(path) {
        filesystemCall(() => this.#descriptor.createDirectoryAt(path));
    }
    async stat() {
        return stat(filesystemCall(() => this.#descriptor.stat()));
    }
    async statAt(pathFlags, path) {
        return stat(filesystemCall(() => this.#descriptor.statAt(pathFlags, path)));
    }
    async setTimesAt(pathFlags, path, dataAccessTimestamp, dataModificationTimestamp) {
        filesystemCall(() => this.#descriptor.setTimesAt(pathFlags, path, dataAccessTimestamp, dataModificationTimestamp));
    }
    async linkAt(oldPathFlags, oldPath, newDescriptor, newPath) {
        filesystemCall(() => this.#descriptor.linkAt(oldPathFlags, oldPath, newDescriptor.#descriptor, newPath));
    }
    async openAt(pathFlags, path, openFlags, flags) {
        return Descriptor._wrap(filesystemCall(() => this.#descriptor.openAt(pathFlags, path, openFlags, flags)));
    }
    async readlinkAt(path) {
        return filesystemCall(() => this.#descriptor.readlinkAt(path));
    }
    async removeDirectoryAt(path) {
        filesystemCall(() => this.#descriptor.removeDirectoryAt(path));
    }
    async renameAt(oldPath, newDescriptor, newPath) {
        filesystemCall(() => this.#descriptor.renameAt(oldPath, newDescriptor.#descriptor, newPath));
    }
    async symlinkAt(oldPath, newPath) {
        filesystemCall(() => this.#descriptor.symlinkAt(oldPath, newPath));
    }
    async unlinkFileAt(path) {
        filesystemCall(() => this.#descriptor.unlinkFileAt(path));
    }
    async isSameObject(other) {
        return filesystemCall(() => this.#descriptor.isSameObject(other.#descriptor));
    }
    async metadataHash() {
        return filesystemCall(() => this.#descriptor.metadataHash());
    }
    async metadataHashAt(pathFlags, path) {
        return filesystemCall(() => this.#descriptor.metadataHashAt(pathFlags, path));
    }
    [symbolDispose]() {
        this.#descriptor[symbolDispose]?.();
    }
}
export function wrapDescriptor(descriptor) {
    return Descriptor._wrap(descriptor);
}
export default {
    Descriptor,
};
