import minimist from "minimist";
import { spawnSync } from "child_process";

const defaultParams = {
  c: 5,
  t: 5000,
  d: ".",
};

const params = minimist(process.argv.slice(2));

const BEFORE = params.b || params.before;
const AFTER = params.a || params.after;
const COUNT = params.c || params.count || defaultParams.c;
const TIMEOUT = params.t || params.timeout || defaultParams.t;
const OUTPUT_DIR = params.d || params.dir || defaultParams.d;

if (!BEFORE || !AFTER) {
  throw "Enter before and after urls";
}

const beforeResultsPath = `${OUTPUT_DIR}/before.json`;
const afterResultsPath = `${OUTPUT_DIR}/after.json`;
const diffFilePath = `${OUTPUT_DIR}/diff.md`;

const spawnProcess = (command, args) =>
  spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr],
    encoding: "utf-8",
  });

spawnProcess("mkdir", ["-p", OUTPUT_DIR]);

spawnProcess("node", [
  "lighthouse.mjs",
  "-c",
  COUNT,
  "-t",
  TIMEOUT,
  "-u",
  BEFORE,
  "-o",
  beforeResultsPath,
]);

spawnProcess("node", [
  "lighthouse.mjs",
  "-c",
  COUNT,
  "-t",
  TIMEOUT,
  "-u",
  AFTER,
  "-o",
  afterResultsPath,
]);

spawnProcess("node", [
  "diff.mjs",
  "-b",
  beforeResultsPath,
  "-a",
  afterResultsPath,
  "-o",
  diffFilePath,
]);
