// @ts-check

const { execSync } = require("node:child_process");
const { writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const getWorkspace = require("./get-workspace-all.cjs");

const getOutputDir = () => join(process.cwd(), ".changes");
const getOutputPath = () => join(getOutputDir(), "config.json");

const fn = () => {
  const config = getWorkspace();
  const outputdir = getOutputDir();
  if (!existsSync(outputdir)) {
    execSync(`mkdir -p ${outputdir}`);
  }
  writeFileSync(getOutputPath(), JSON.stringify(config, null, 2));
  execSync(
    `node node_modules/prettier/bin/prettier.cjs .changes/config.json --write --log-level log`
  );
};

if (process.argv[1].split("/").pop() === "generate-covector-config.cjs") {
  fn();
}

module.exports = () => fn();
