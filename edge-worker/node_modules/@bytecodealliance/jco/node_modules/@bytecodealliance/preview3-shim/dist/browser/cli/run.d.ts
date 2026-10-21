type RunHandler = () => void | Promise<void>;
declare function run(): Promise<void>;
export declare function _setRun(next: RunHandler | undefined): RunHandler | undefined;
declare const _default: {
    run: typeof run;
};
export default _default;
export type * from "../../../types/interfaces/wasi-cli-run.d.ts";
