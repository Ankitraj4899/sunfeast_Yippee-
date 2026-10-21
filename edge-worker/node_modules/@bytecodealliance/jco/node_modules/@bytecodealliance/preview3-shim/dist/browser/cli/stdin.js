import { stdin } from "@bytecodealliance/preview2-shim/cli";
import { readableFromPreview2Input } from "../streams.js";
function readViaStream() {
    return readableFromPreview2Input(stdin.getStdin(), () => "io");
}
export default {
    readViaStream,
};
