const { execSync } = require("node:child_process")

const BRANCH_PATTERNS = [
  /^feature\/\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^fix\/\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^chore\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^docs\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^ci\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
]

const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
  encoding: "utf8",
}).trim()

if (currentBranch === "HEAD") {
  process.exit(0)
}

if (currentBranch === "main" || currentBranch === "dev") {
  console.error(
    `DX violation: direct commits on '${currentBranch}' are blocked. Create a short-lived PR branch.`,
  )
  process.exit(1)
}

if (!BRANCH_PATTERNS.some((pattern) => pattern.test(currentBranch))) {
  console.error(`DX violation: invalid branch name '${currentBranch}'.`)
  console.error("Allowed formats:")
  console.error("  feature/<issue>-description  e.g. feature/12-product-crud")
  console.error("  fix/<issue>-description      e.g. fix/25-auth-error")
  console.error("  chore/<description>          e.g. chore/update-deps")
  console.error("  docs/<description>           e.g. docs/api-readme")
  console.error("  ci/<description>             e.g. ci/add-lint-check")
  process.exit(1)
}
