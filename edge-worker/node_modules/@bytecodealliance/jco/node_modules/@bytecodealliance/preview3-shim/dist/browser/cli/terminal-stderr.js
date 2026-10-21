import { terminalStderr } from "@bytecodealliance/preview2-shim/cli";
function getTerminalStderr() {
    return terminalStderr.getTerminalStderr();
}
export default {
    getTerminalStderr,
};
