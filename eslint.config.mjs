import eslintConfigPrettier from "eslint-config-prettier";
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  	eslintConfigPrettier,
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
];
