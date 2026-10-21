import { terminalStdin } from "@bytecodealliance/preview2-shim/cli";
function getTerminalStdin() {
    return terminalStdin.getTerminalStdin();
}
export default {
    getTerminalStdin,
};
