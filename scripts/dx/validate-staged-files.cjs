const { execSync } = require("node:child_process")
const { existsSync, readFileSync } = require("node:fs")
const path = require("node:path")

const stagedFiles = execSync("git diff --cached --name-only --diff-filter=ACMR", {
  encoding: "utf8",
})
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean)

const violations = []

const isPascalCase = (value) => /^[A-Z][A-Za-z0-9]*$/.test(value)
const isCamelCase = (value) => /^[a-z][A-Za-z0-9]*$/.test(value)
const isKebabCase = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

for (const file of stagedFiles) {
  const normalized = file.replaceAll("\\", "/")
  const extension = path.extname(normalized)
  const baseName = path.basename(normalized, extension)

  if (!existsSync(file)) {
    continue
  }

  if (normalized.startsWith("src/generated/prisma/")) {
    continue
  }

  if (normalized.startsWith("src/components/ui/")) {
    continue
  }

  if (normalized.startsWith("src/components/") && extension === ".tsx") {
    if (!isPascalCase(baseName)) {
      violations.push(`${file}: React component files must use PascalCase.tsx.`)
    }

    const lineCount = readFileSync(file, "utf8").split(/\r?\n/).length
    if (lineCount > 150) {
      violations.push(`${file}: component is ${lineCount} lines; limit is 150.`)
    }
  }

  if (normalized.startsWith("src/hooks/") && [".ts", ".tsx"].includes(extension)) {
    if (!baseName.startsWith("use") || !isCamelCase(baseName)) {
      violations.push(`${file}: hook files must use camelCase and start with 'use'.`)
    }
  }

  if (normalized.startsWith("src/app/")) {
    const segments = normalized.split("/")
    for (const segment of segments.slice(2, -1)) {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        continue
      }

      if (!isKebabCase(segment) && segment !== "components" && segment !== "types") {
        violations.push(`${file}: app route folders must use kebab-case.`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error("DX violations in staged files:")
  for (const violation of violations) {
    console.error(`  - ${violation}`)
  }
  process.exit(1)
}
