const { execSync } = require("node:child_process")
const { readFileSync } = require("node:fs")

const commitMessageFile = process.argv[2]
const message = readFileSync(commitMessageFile, "utf8").trim()
const firstLine = message.split(/\r?\n/, 1)[0]

const validCommitPattern = /^(feat|fix|chore|docs|ci): [a-z0-9][a-z0-9 .,'()/-]{1,70}$/
const generatedPatterns = [/^Merge /, /^Revert "/]

if (generatedPatterns.some((pattern) => pattern.test(firstLine))) {
  process.exit(0)
}

if (!validCommitPattern.test(firstLine)) {
  console.error(`DX violation: invalid commit message '${firstLine}'.`)
  console.error("Use Conventional Commit style:")
  console.error("  feat: add product card")
  console.error("  fix: handle auth error")
  console.error("  chore: add husky hooks")
  console.error("  docs: update api readme")
  console.error("  ci: add lint check")
  process.exit(1)
}

const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim()
const branchType = branch.split("/", 1)[0]
const commitType = firstLine.split(":", 1)[0]
const expectedTypesByBranch = {
  feature: ["feat"],
  fix: ["fix"],
  chore: ["chore"],
  docs: ["docs"],
  ci: ["ci"],
}

const expectedTypes = expectedTypesByBranch[branchType]

if (expectedTypes && !expectedTypes.includes(commitType)) {
  console.error(
    `DX violation: '${commitType}' commits are not allowed on '${branchType}' branches.`,
  )
  console.error(`Expected commit type: ${expectedTypes.join(" or ")}`)
  process.exit(1)
}
