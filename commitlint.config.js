module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[#[0-9]+\]\s(\w*)(\(.+\))?: (.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "issue-reference": ({ header }) => {
          const issuePattern = /^\[#[0-9]+\]\s/;
          if (!issuePattern.test(header)) {
            return [
              false,
              "Commit message must start with issue reference like [#123]",
            ];
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "chore",
        "style",
        "refactor",
        "ci",
        "test",
        "revert",
        "perf",
        "vercel",
      ],
    ],
    "subject-case": [0], // Disable subject case checking
    "header-max-length": [2, "always", 100], // Allow longer headers for issue references
    "issue-reference": [2, "always"],
  },
};
