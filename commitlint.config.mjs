const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'release', 'chore', 'revert', 'ci'];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-empty': [2, 'never'], // type cannot be empty
    'type-enum': [2, 'always', types], // type must be one of the predefined types
    'type-case': [2, 'always', 'lower-case'], // type must be in lowercase
    'scope-case': [0, 'never'], // disable case checking for scope
    'subject-empty': [2, 'never'], // subject cannot be empty
    'subject-case': [0, 'never'], // disable case checking for subject
    'header-max-length': [2, 'always', 100], // header length must not exceed 88 characters
  },
};
