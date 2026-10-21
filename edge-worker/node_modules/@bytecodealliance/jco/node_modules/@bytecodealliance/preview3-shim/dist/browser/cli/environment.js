import { _setCwd as setPreview2Cwd, environment } from "@bytecodealliance/preview2-shim/cli";
let initialCwd = environment.initialCwd();
export function _setCwd(cwd) {
    initialCwd = cwd;
    setPreview2Cwd(cwd);
}
function getEnvironment() {
    return environment.getEnvironment();
}
function getArguments() {
    return environment.getArguments();
}
function getInitialCwd() {
    return initialCwd;
}
export default {
    getEnvironment,
    getArguments,
    getInitialCwd,
};
