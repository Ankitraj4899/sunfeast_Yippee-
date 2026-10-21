import * as preview2Http from "@bytecodealliance/preview2-shim/http";
import { readableFromPreview2Input, writeToPreview2Output } from "../streams.js";
import { Fields, Request, Response } from "./types.js";
class HttpError extends Error {
    payload;
    constructor(payload, message) {
        super(message ?? payload.tag);
        this.name = "HttpError";
        this.payload = payload;
    }
}
function internalError(error) {
    return {
        tag: "internal-error",
        val: error instanceof Error ? error.message : String(error),
    };
}
function preview2Options(options) {
    if (!options) {
        return undefined;
    }
    const converted = new preview2Http.types.RequestOptions();
    converted.setConnectTimeout(options.getConnectTimeout());
    converted.setFirstByteTimeout(options.getFirstByteTimeout());
    converted.setBetweenBytesTimeout(options.getBetweenBytesTimeout());
    return converted;
}
async function responseTrailers(incomingBody, bodyResult) {
    const completed = await bodyResult;
    if (completed.tag === "err") {
        return completed;
    }
    const future = preview2Http.types.IncomingBody.finish(incomingBody);
    await future.subscribe().block();
    const result = future.get();
    if (!result || result.tag === "err") {
        return { tag: "err", val: internalError("response trailers were already consumed") };
    }
    if (result.val.tag === "err") {
        return { tag: "err", val: result.val.val };
    }
    const fields = result.val.val;
    return {
        tag: "ok",
        val: fields ? new Fields(fields) : undefined,
    };
}
function trailerEntries(trailers) {
    if (trailers?.tag === "none") {
        return [];
    }
    if (trailers?.tag === "some") {
        return trailerEntries(trailers.val);
    }
    if (trailers instanceof Fields) {
        return trailers.copyAll();
    }
    if (Array.isArray(trailers)) {
        return trailers;
    }
    throw new TypeError("trailers must be Fields or a list of entries");
}
async function send(request) {
    if (!(request instanceof Request)) {
        throw new TypeError("request must be a Request resource");
    }
    const outgoing = new preview2Http.types.OutgoingRequest(request.getHeaders()._preview2.clone());
    outgoing.setMethod(request.getMethod());
    outgoing.setScheme(request.getScheme() ?? { tag: "HTTP" });
    outgoing.setAuthority(request.getAuthority());
    outgoing.setPathWithQuery(request.getPathWithQuery());
    let transmit = Promise.resolve({ tag: "ok", val: undefined });
    const contents = request._body();
    if (contents) {
        const outgoingBody = outgoing.body();
        transmit = (async () => {
            let result = { tag: "ok", val: undefined };
            try {
                await writeToPreview2Output(contents, outgoingBody.write());
                const trailers = await request._trailers();
                if (trailers.tag === "err") {
                    result = trailers;
                }
                else if (trailers.val && trailerEntries(trailers.val).length > 0) {
                    result = {
                        tag: "err",
                        val: {
                            tag: "internal-error",
                            val: "browser Fetch does not support request trailers",
                        },
                    };
                }
            }
            catch (error) {
                result = { tag: "err", val: internalError(error) };
            }
            finally {
                try {
                    preview2Http.types.OutgoingBody.finish(outgoingBody, undefined);
                }
                catch (error) {
                    if (result.tag === "ok") {
                        result = { tag: "err", val: internalError(error) };
                    }
                }
            }
            return result;
        })();
    }
    else {
        transmit = request
            ._trailers()
            .then((trailers) => (trailers.tag === "err" ? trailers : { tag: "ok", val: undefined }));
    }
    const future = preview2Http.outgoingHandler.handle(outgoing, preview2Options(request.getOptions()));
    void transmit.then((result) => request._resolve(result));
    try {
        await future.subscribe().block();
        const result = future.get();
        if (!result || result.tag === "err") {
            throw new HttpError(internalError("HTTP response future was already consumed"));
        }
        if (result.val.tag === "err") {
            throw new HttpError(result.val.val);
        }
        const incoming = result.val.val;
        const headers = new Fields(incoming.headers().clone());
        const incomingBody = incoming.consume();
        const [contents, bodyResult] = readableFromPreview2Input(incomingBody.stream(), internalError);
        const [response] = Response.new(headers, contents, responseTrailers(incomingBody, bodyResult));
        response.setStatusCode(incoming.status());
        return response;
    }
    catch (error) {
        const httpError = error instanceof HttpError ? error : new HttpError(internalError(error));
        request._resolve({ tag: "err", val: httpError.payload });
        throw httpError;
    }
}
export default {
    send,
};
