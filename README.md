# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# Numerology

## Local English word list

The Password page searches `public/english-words.txt` locally for words whose
letters map to the entered digits. The list contains lowercase alphabetic base
entries extracted from the American English Hunspell dictionary in
[`dictionary-en`](https://github.com/wooorm/dictionaries/tree/main/dictionaries/en),
which is derived from SCOWL. The source dictionary's MIT-and-BSD license and
notices are included in [`public/english-words.LICENSE`](./public/english-words.LICENSE).
