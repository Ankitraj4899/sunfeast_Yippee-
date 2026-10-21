import { exit as preview2Exit } from "@bytecodealliance/preview2-shim/cli";
const exitWithCodeV2 = preview2Exit;
function exit(status) {
    preview2Exit.exit(status);
}
function exitWithCode(statusCode) {
    exitWithCodeV2.exitWithCode(statusCode);
}
export default {
    exit,
    exitWithCode,
};
