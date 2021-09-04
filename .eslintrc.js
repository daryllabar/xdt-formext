module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": [
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:prettier/recommended"
    ],
    "ignorePatterns": [
        ".eslintrc.js",
        ".prettierrc.js",
        "jest.config.js",
        "webpack.*",
        "typings/**/*"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "createDefaultProgram": true,
        "ecmaVersion": 12,
        "project": ["./tsconfig.json"],
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "prettier"
    ],
    "root": true,
    "rules": {
        "@typescript-eslint/no-explicit-any": "off"
    }
};