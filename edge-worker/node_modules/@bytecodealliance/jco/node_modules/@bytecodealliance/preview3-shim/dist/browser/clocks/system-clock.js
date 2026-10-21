import { wallClock } from "@bytecodealliance/preview2-shim/clocks";
function now() {
    return wallClock.now();
}
function getResolution() {
    const resolution = wallClock.resolution();
    return resolution.seconds * 1000000000n + BigInt(resolution.nanoseconds);
}
export default {
    now,
    getResolution,
};
