// @ts-check

const child_process = require("node:child_process");

/** Run a shell command and return stdout as string */
const sh = (/** @type {string} */ cmd) =>
  child_process.execSync(cmd, { encoding: "utf-8" }).trim();

const fn = () => {
  const repoRoot = sh(`git rev-parse --show-toplevel`);

  const cargoMetadata = JSON.parse(
    sh("cargo metadata --locked --no-deps --format-version 1")
  );

  const packageNames = cargoMetadata.packages.map(
    (/** @type {{ name: string; }} */ p) => p.name
  );

  return cargoMetadata.packages
    .map(
      (
        /** @type {{ name: string; version: string; manifest_path: string; dependencies: { name: string; }[]; }} */ p
      ) => ({
        name: p.name,
        version: p.version,
        manager: "rust",
        manifestPath: p.manifest_path
          .replace(repoRoot, "")
          .replace("/Cargo.toml", "")
          .slice(1),
        dependencies: p.dependencies
          .map((/** @type {{ name: string; }} */ d) => d.name)
          .filter((/** @type {string} */ d) => packageNames.includes(d)),
        reverseDependencies: cargoMetadata.packages
          .filter((/** @type {{ name: string; dependencies: any[] }} */ pkg) =>
            pkg.dependencies.some(
              (/** @type {{ name: string; }} */ d) => d.name === p.name
            )
          )
          .map((/** @type {{ name: string; }} */ d) => d.name),
      })
    )
    .sort(
      (
        /** @type {{ name: string; }} */ a,
        /** @type {{ name: string; }} */ b
      ) => a.name.localeCompare(b.name)
    );
};

if (process.argv[1].split("/").pop() === "get-workspace-rs.cjs") {
  console.log(
    "workspace\n",
    fn().map(
      (/** @type {{ manifestPath: string; name: string; }} */ p) =>
        `${p.name}: ${p.manifestPath}`
    )
  );
}

module.exports = () => fn();
