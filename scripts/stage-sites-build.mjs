import { execFileSync } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const openNextRoot = path.join(projectRoot, ".open-next");
const distRoot = path.join(projectRoot, "dist");
const serverRoot = path.join(distRoot, "server");
const clientRoot = path.join(distRoot, "client");
const hostingSource = path.join(projectRoot, ".openai", "hosting.json");
const workerSource = path.join(openNextRoot, "worker.js");
const assetsSource = path.join(openNextRoot, "assets");
const workerOutput = path.join(serverRoot, "index.js");
const wranglerCli = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

if (
  path.dirname(distRoot) !== projectRoot ||
  path.basename(distRoot) !== "dist"
) {
  throw new Error(`Refusing to stage an unexpected output path: ${distRoot}`);
}

await access(workerSource);
await access(assetsSource);
await access(wranglerCli);

await rm(distRoot, { recursive: true, force: true });
await mkdir(serverRoot, { recursive: true });
await cp(assetsSource, clientRoot, { recursive: true });

execFileSync(
  process.execPath,
  [
    wranglerCli,
    "deploy",
    workerSource,
    "--dry-run",
    "--outdir",
    serverRoot,
    "--minify",
    "--compatibility-date",
    "2026-08-18",
    "--compatibility-flags",
    "nodejs_compat",
    "--compatibility-flags",
    "global_fetch_strictly_public",
  ],
  { cwd: projectRoot, stdio: "inherit" },
);

await rename(path.join(serverRoot, "worker.js"), workerOutput);
await rm(path.join(serverRoot, "worker.js.map"), { force: true });
await rm(path.join(serverRoot, "README.md"), { force: true });

const workerBundle = await readFile(workerOutput, "utf8");

await writeFile(
  workerOutput,
  workerBundle.replace(/\n?\/\/# sourceMappingURL=worker\.js\.map\s*$/, "\n"),
);

await access(workerOutput);
await access(path.join(clientRoot, "_next", "static"));

const wranglerConfig = {
  main: "index.js",
  compatibility_date: "2026-08-18",
  compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
  assets: {
    directory: "../client",
    binding: "ASSETS",
  },
  no_bundle: true,
};

await writeFile(
  path.join(serverRoot, "wrangler.json"),
  `${JSON.stringify(wranglerConfig, null, 2)}\n`,
);

const hosting = JSON.parse(await readFile(hostingSource, "utf8"));

if (typeof hosting.project_id !== "string" || hosting.project_id.length === 0) {
  throw new Error(".openai/hosting.json must contain a project_id");
}

await mkdir(path.join(distRoot, ".openai"), { recursive: true });
await cp(hostingSource, path.join(distRoot, ".openai", "hosting.json"));
