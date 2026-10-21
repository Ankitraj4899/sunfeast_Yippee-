import type { Descriptor as DescriptorT, Advice, DescriptorFlags, DescriptorStat, DescriptorType, DirectoryEntry, ErrorCode, Filesize, MetadataHashValue, NewTimestamp, OpenFlags, PathFlags, Result } from "../../../types/interfaces/wasi-filesystem-types.d.ts";
import { readableFromPreview2Input, writeToPreview2Output } from "../streams.js";
declare const symbolDispose: symbol;
type Preview2Descriptor = {
    readViaStream(offset: Filesize): Parameters<typeof readableFromPreview2Input>[0];
    writeViaStream(offset: Filesize): Parameters<typeof writeToPreview2Output>[1];
    appendViaStream(): Parameters<typeof writeToPreview2Output>[1];
    advise(offset: Filesize, length: Filesize, advice: Advice): void;
    syncData(): void;
    getFlags(): DescriptorFlags;
    getType(): string;
    setSize(size: Filesize): void;
    setTimes(dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): void;
    readDirectory(): {
        readDirectoryEntry(): {
            type: string;
            name: string;
        } | undefined;
    };
    sync(): void;
    createDirectoryAt(path: string): void;
    stat(): Omit<DescriptorStat, "type"> & {
        type: string;
    };
    statAt(pathFlags: PathFlags, path: string): Omit<DescriptorStat, "type"> & {
        type: string;
    };
    setTimesAt(pathFlags: PathFlags, path: string, dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): void;
    linkAt(oldPathFlags: PathFlags, oldPath: string, newDescriptor: Preview2Descriptor, newPath: string): void;
    openAt(pathFlags: PathFlags, path: string, openFlags: OpenFlags, flags: DescriptorFlags): Preview2Descriptor;
    readlinkAt(path: string): string;
    removeDirectoryAt(path: string): void;
    renameAt(oldPath: string, newDescriptor: Preview2Descriptor, newPath: string): void;
    symlinkAt(oldPath: string, newPath: string): void;
    unlinkFileAt(path: string): void;
    isSameObject(other: Preview2Descriptor): boolean;
    metadataHash(): MetadataHashValue;
    metadataHashAt(pathFlags: PathFlags, path: string): MetadataHashValue;
};
export declare function filesystemErrorCode(error: unknown): ErrorCode;
export declare class Descriptor implements DescriptorT {
    #private;
    [symbolDispose]: () => void;
    static _wrap(descriptor: Preview2Descriptor): Descriptor;
    readViaStream(offset: Filesize): [ReadableStream<number>, Promise<Result<void, ErrorCode>>];
    writeViaStream(data: ReadableStream<number>, offset: Filesize): Promise<Result<void, ErrorCode>>;
    appendViaStream(data: ReadableStream<number>): Promise<Result<void, ErrorCode>>;
    advise(offset: Filesize, length: Filesize, advice: Advice): Promise<void>;
    syncData(): Promise<void>;
    getFlags(): Promise<DescriptorFlags>;
    getType(): Promise<DescriptorType>;
    setSize(size: Filesize): Promise<void>;
    setTimes(dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): Promise<void>;
    readDirectory(): [ReadableStream<DirectoryEntry>, Promise<Result<void, ErrorCode>>];
    sync(): Promise<void>;
    createDirectoryAt(path: string): Promise<void>;
    stat(): Promise<DescriptorStat>;
    statAt(pathFlags: PathFlags, path: string): Promise<DescriptorStat>;
    setTimesAt(pathFlags: PathFlags, path: string, dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): Promise<void>;
    linkAt(oldPathFlags: PathFlags, oldPath: string, newDescriptor: Descriptor, newPath: string): Promise<void>;
    openAt(pathFlags: PathFlags, path: string, openFlags: OpenFlags, flags: DescriptorFlags): Promise<Descriptor>;
    readlinkAt(path: string): Promise<string>;
    removeDirectoryAt(path: string): Promise<void>;
    renameAt(oldPath: string, newDescriptor: Descriptor, newPath: string): Promise<void>;
    symlinkAt(oldPath: string, newPath: string): Promise<void>;
    unlinkFileAt(path: string): Promise<void>;
    isSameObject(other: Descriptor): Promise<boolean>;
    metadataHash(): Promise<MetadataHashValue>;
    metadataHashAt(pathFlags: PathFlags, path: string): Promise<MetadataHashValue>;
}
export declare function wrapDescriptor(descriptor: unknown): Descriptor;
declare const _default: {
    Descriptor: typeof Descriptor;
};
export default _default;
export type * from "../../../types/interfaces/wasi-filesystem-types.d.ts";
