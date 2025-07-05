// @ts-check

const path = require("node:path");
const fs = require("node:fs");
const yaml = require("yaml");

const child_process = require("node:child_process");

/** Run a shell command and return stdout as string */
const sh = (/** @type {string} */ cmd) =>
  child_process.execSync(cmd, { encoding: "utf-8" }).trim();

const fn = () => {
  const repoRoot = sh(`git rev-parse --show-toplevel`);

  const loc = path.resolve(__dirname, "../pnpm-workspace.yaml");
  const data = fs.readFileSync(loc, { encoding: "utf-8" });
  const workspacePaths = yaml.parse(data).packages;

  const workspaceNames = [];

  for (const manifestPath of workspacePaths) {
    const loc = path.resolve(__dirname, "../", manifestPath, "package.json");
    const data = fs.readFileSync(loc, { encoding: "utf-8" });
    const pkg = JSON.parse(data);
    const { name, version } = pkg;
    workspaceNames.push({ name, version, manifestPath, pkg });
  }

  const workspace = [];

  for (const { name, version, manifestPath, pkg } of workspaceNames) {
    const dependencies = Object.entries(pkg.dependencies ?? {});
    const devDependencies = Object.entries(pkg.devDependencies ?? {});
    const peerDependencies = Object.entries(pkg.peerDependencies ?? {});
    const optionalDependencies = Object.entries(pkg.optionalDependencies ?? {});
    const bundleDependencies = Object.entries(pkg.bundleDependencies ?? {});
    const allDependencies = [
      ...dependencies,
      ...devDependencies,
      ...peerDependencies,
      ...optionalDependencies,
      ...bundleDependencies,
    ];

    workspace.push({
      name,
      version,
      manager: "javascript",
      manifestPath,
      dependencies: allDependencies
        .filter((d) => d[1] === "workspace:*")
        .map((d) => d[0].replace("@fltsci/", "")),
      reverseDependencies: workspaceNames
        .filter((pkg) => {
          return allDependencies.map((d) => d[0]).includes(pkg.name);
        })
        .map((pkg) => pkg.name),
      covector: pkg.covector ?? {},
    });
  }

  return workspace;
};

if (process.argv[1].split("/").pop() === "get-workspace-js.cjs") {
  console.log(
    "workspace-js\n",
    fn().map(
      (
        /** @type {{ manifestPath: string; name: string; dependencies: string[]; }} */ p
      ) => `${p.name}: ${JSON.stringify(p.dependencies)}`
    )
  );
}

module.exports = () => fn();
