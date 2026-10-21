import { terminalStdout } from "@bytecodealliance/preview2-shim/cli";
function getTerminalStdout() {
    return terminalStdout.getTerminalStdout();
}
export default {
    getTerminalStdout,
};
