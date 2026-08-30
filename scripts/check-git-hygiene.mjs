import { execFileSync } from "node:child_process";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function listGitFiles(args) {
  return git(args).split("\0").filter(Boolean);
}

const trackedFiles = listGitFiles(["ls-files", "-z"]);
const stagedFiles = listGitFiles(["diff", "--cached", "--name-only", "-z"]);
const trackedEnvFiles = trackedFiles.filter(
  (file) => /^\.env(?:\.|$)/i.test(file) && file !== ".env.example"
);
const stagedSecretFiles = stagedFiles.filter((file) =>
  /(?:^|\/)(?:\.env(?:\.|$)|.*(?:credential|secret|private-key).*)/i.test(file)
);

const contentRules = [
  {
    label: "private key",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  },
  {
    label: "AWS access key",
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    label: "Resend API key",
    pattern: /\bre_[A-Za-z0-9_-]{20,}\b/,
  },
  {
    label: "GitHub token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
  },
  {
    label: "OpenAI API key",
    pattern: /\bsk-[A-Za-z0-9]{20,}\b/,
  },
  {
    label: "Stripe key",
    pattern: /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{10,}\b/,
  },
  {
    label: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{30,}\b/,
  },
  {
    label: "Slack token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  },
  {
    label: "JWT",
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    label: "credentialed database URL",
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^/\s:@]+:[^@\s]+@/,
  },
  {
    label: "literal secret assignment",
    pattern:
      /\b(?:api[_-]?key|client[_-]?secret|app[_-]?secret|access[_-]?token|auth[_-]?token|password|secret)\s*[:=]\s*["'](?!process\.env|replace|your-|example|placeholder|test_|dummy|changeme)[^"']{12,}["']/i,
  },
];

const contentFindings = [];
for (const file of stagedFiles) {
  // The template intentionally contains local development placeholders.
  if (file === ".env.example") continue;

  let content;
  try {
    content = git(["show", `:${file}`]);
  } catch {
    continue;
  }

  for (const rule of contentRules) {
    if (rule.pattern.test(content)) {
      contentFindings.push(`${file} (${rule.label})`);
    }
  }
}

const failures = [
  ...trackedEnvFiles.map((file) => `tracked environment file: ${file}`),
  ...stagedSecretFiles.map((file) => `staged secret-named file: ${file}`),
  ...contentFindings.map((finding) => `staged secret-like content: ${finding}`),
];

if (failures.length > 0) {
  console.error("Git hygiene check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Git hygiene check passed: ${stagedFiles.length} staged file(s) checked; .env files and secret-like content are clear.`
  );
}
