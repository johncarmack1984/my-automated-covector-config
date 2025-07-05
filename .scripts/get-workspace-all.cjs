// @ts-check

const { execSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");

const getWorkspaceRs = require("./get-workspace-rs.cjs");
const getWorkspaceJs = require("./get-workspace-js.cjs");

const baseConfig = {
  gitSiteUrl:
    "https://github.com/johncarmack1984/my-automated-covector-config/",
  pkgManagers: {
    javascript: {
      version: true,
      getPublishedVersion:
        'git tag -l --sort=-v:refname "${ pkg.pkg }-v${ pkgFile.version }" | sed s/${ pkg.pkg }-v//',
      publish: ['echo "Publishing ${ pkg.pkg }-v${ pkgFile.version }"'],
      releaseTag: "${ pkg.pkg }-v${ pkgFile.version }",
    },
    rust: {
      version: true,
      getPublishedVersion:
        'git tag -l --sort=-v:refname "${ pkg.pkg }-v${ pkgFile.version }" | sed s/${ pkg.pkg }-v//',
      publish: ['echo "Publishing ${ pkg.pkg }-v${ pkgFile.version }"'],
      releaseTag: "${ pkg.pkg }-v${ pkgFile.version }",
    },
  },
};

const fn = () => {
  const workspaceRs = getWorkspaceRs();
  const workspaceJs = getWorkspaceJs();

  const packages = {};

  for (const p of [...workspaceRs, ...workspaceJs]
    .map((p) => ({ ...p, name: p.name.replace("@fltsci/", "") }))
    .sort((a, b) => a.name.localeCompare(b.name))) {
    packages[p.name] = {
      ...(p.covector ?? {}),
      path: `./${p.manifestPath}`,
      manager: p.manager,
      dependencies: p.dependencies ?? [],
    };
  }

  return {
    ...baseConfig,
    packages,
  };
};

if (process.argv[1].split("/").pop() === "generate-covector-config.cjs") {
  fn();
}

module.exports = () => fn();
