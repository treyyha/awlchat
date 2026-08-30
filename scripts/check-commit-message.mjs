import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/check-commit-message.mjs <commit-message-file>");
  process.exit(2);
}

const message = readFileSync(file, "utf8");
const subject = message
  .split(/\r?\n/)
  .find((line) => line.trim() && !line.trim().startsWith("#"))
  ?.trim();
const conventionalCommit =
  /^(feat|fix|chore|docs|refactor|test)(\([a-z0-9][a-z0-9._/-]*\))?!?: .+/;

if (!subject || !conventionalCommit.test(subject)) {
  console.error(
    "Commit message must start with feat:, fix:, chore:, docs:, refactor:, or test:."
  );
  console.error("Example: feat(auth): restrict sign-in to allowed emails");
  process.exit(1);
}

console.log(`Conventional commit message accepted: ${subject}`);
