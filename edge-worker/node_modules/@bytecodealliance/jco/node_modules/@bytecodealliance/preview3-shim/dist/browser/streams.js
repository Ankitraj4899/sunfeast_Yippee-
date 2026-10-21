const symbolDispose = Symbol.dispose ?? Symbol.for("dispose");
const BYTE_CHUNK_SIZE = 64 * 1024;
const P2_WRITE_CHUNK_SIZE = 4096;
function byteChunk(value) {
    if (value instanceof Uint8Array) {
        return value;
    }
    if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
    }
    if (Array.isArray(value)) {
        return Uint8Array.from(value);
    }
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value < 0 || value > 255) {
            throw new RangeError(`invalid byte stream value: ${value}`);
        }
        return Uint8Array.of(value);
    }
    if (typeof value === "string") {
        return new TextEncoder().encode(value);
    }
    throw new TypeError("byte stream values must be bytes or byte arrays");
}
function isIteratorResult(value) {
    return value !== null && typeof value === "object" && "done" in value;
}
async function* byteChunks(data) {
    const stream = data;
    if (typeof stream.read === "function") {
        while (true) {
            const value = await stream.read({ count: BYTE_CHUNK_SIZE });
            if (isIteratorResult(value)) {
                if (value.done) {
                    return;
                }
                yield byteChunk(value.value);
            }
            else if (value === null) {
                return;
            }
            else {
                yield byteChunk(value);
            }
        }
    }
    if (typeof stream[Symbol.asyncIterator] === "function") {
        for await (const value of stream) {
            yield byteChunk(value);
        }
        return;
    }
    throw new TypeError("byte stream must provide read() or [Symbol.asyncIterator]()");
}
export async function writeToPreview2Output(data, output) {
    for await (const bytes of byteChunks(data)) {
        for (let offset = 0; offset < bytes.byteLength; offset += P2_WRITE_CHUNK_SIZE) {
            output.blockingWriteAndFlush(bytes.subarray(offset, offset + P2_WRITE_CHUNK_SIZE));
        }
    }
    output.blockingFlush();
}
export function readableFromPreview2Input(input, errorCode) {
    let resolveResult = () => { };
    const result = new Promise((resolve) => (resolveResult = resolve));
    let settled = false;
    const settle = (value) => {
        if (!settled) {
            settled = true;
            resolveResult(value);
        }
    };
    const readable = new ReadableStream({
        async pull(controller) {
            try {
                const bytes = await input.blockingRead(BigInt(BYTE_CHUNK_SIZE));
                for (const byte of bytes) {
                    controller.enqueue(byte);
                }
            }
            catch (error) {
                if (error?.tag === "closed") {
                    controller.close();
                    settle({ tag: "ok", val: undefined });
                    return;
                }
                settle({ tag: "err", val: errorCode(error) });
                controller.error(error);
            }
        },
        cancel() {
            settle({ tag: "ok", val: undefined });
        },
    });
    return [readable, result];
}
export function preview2StreamErrorCode(error) {
    const code = error?.code;
    if (code === "EPIPE" || code === "ERR_STREAM_PREMATURE_CLOSE") {
        return "pipe";
    }
    if (code === "ERR_ENCODING_INVALID_ENCODED_DATA") {
        return "illegal-byte-sequence";
    }
    return "io";
}
