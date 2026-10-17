import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  // ===== 공통 ignore =====
  {
    ignores: [
      '**/node_modules/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      '.vite-cache/**',
      // 설정/빌드 관련 파일까지 아예 제외해도 됨
      'eslint.config.js',
      'postcss.config.cjs',
      'vite.config.ts',
    ],
  },

  // ===== 기본 추천 세트 (JS + TS) =====
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ===== 공통(전역) 규칙 + 스타일(@stylistic) + React 플러그인들 =====
  {
    plugins: {
      '@stylistic': stylistic,
      import: importPlugin,
      'unused-imports': unusedImports,
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          tsconfigRootDir: process.cwd(),
          alwaysTryTypes: true,
        },
        node: {
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.d.ts',
            '.json',
          ],
        },
      },
    },
    rules: {
      // ===== 스타일(@stylistic) → Prettier 대체 =====
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true },
      ],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/indent': [
        'error',
        2,
        { SwitchCase: 1 },
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
        },
      ],
      '@stylistic/object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: false },
      ],

      '@stylistic/array-bracket-newline': [
        'error',
        {
          multiline: true,
          minItems: 3,
        },
      ],
      '@stylistic/array-element-newline': [
        'error',
        {
          multiline: true,
          minItems: 3,
        },
      ],

      '@stylistic/function-paren-newline': ['error', 'multiline'],
      '@stylistic/function-call-argument-newline': [
        'error',
        'consistent',
      ],

      '@stylistic/newline-per-chained-call': [
        'error',
        { ignoreChainWithDepth: 2 },
      ],

      '@stylistic/operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'after',
            '?': 'after',
            ':': 'after',
          },
        },
      ],
      '@stylistic/max-len': 'off',
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-before-blocks': 'error',
      '@stylistic/brace-style': 'error',
      '@stylistic/arrow-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],
      '@stylistic/template-curly-spacing': 'error',
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'comma',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],

      // ===== TypeScript 관련 =====
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'property',
          format: null,
        },
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'enum 사용 금지 - union type 또는 const 객체 사용 권장',
        },
      ],

      // ===== import 관련 =====
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node 내장
            'external', // 외부 패키지
            'internal', // 소스 내부(alias 등)
            ['parent', 'sibling'], // 상대경로
            'index', // 현재 폴더의 index
            'type', // 타입 전용 import
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['type'],
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // TS 쓸 거니까 no-undef는 끔
      'no-undef': 'off',

      // ===== React 기본 룰 =====
      'react/jsx-uses-react': 'off', // 새 JSX 트랜스폼
      'react/react-in-jsx-scope': 'off', // React import 불필요
      'react/jsx-uses-vars': 'error',
      'react/self-closing-comp': 'warn',
      'react/no-unescaped-entities': 'warn',

      // ===== React Hooks / Refresh =====
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ===== JSX A11y 기본 몇 개만 =====
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },

  // ===== JS/TS/JSX/TSX 전용: unused-imports 세팅 =====
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
]
