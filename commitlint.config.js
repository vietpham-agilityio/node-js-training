/**
 * Every commit header is a GitLab issue number in brackets, followed by a
 * Conventional Commits type and subject — no scope. E.g.:
 *
 *   [#185] chore: seed data sample with current database
 *   [#181] feat: add showtimes and users entities
 *   [#42] fix: reject expired refresh tokens
 *
 * The [#N] prefix is mandatory: a header without it doesn't match
 * headerPattern below, so type/subject parse as empty and the commit is
 * rejected by type-empty/subject-empty.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[#(\d+)\]\s+(\w+)(!)?:\s+(.+)$/,
      headerCorrespondence: ['issue', 'type', 'breaking', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [1, 'always', 100],
  },
};
