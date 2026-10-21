let handler;
async function run() {
    if (!handler) {
        throw new Error("wasi:cli/run import is not configured");
    }
    await handler();
}
export function _setRun(next) {
    const previous = handler;
    handler = next;
    return previous;
}
export default {
    run,
};
