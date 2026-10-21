let currentHandler;
async function handle(request) {
    if (!currentHandler) {
        throw new Error("wasi:http/handler import is not configured");
    }
    return currentHandler.handle(request);
}
export function _setHandler(handler) {
    const previous = currentHandler;
    currentHandler = handler;
    return previous;
}
export default {
    handle,
};
