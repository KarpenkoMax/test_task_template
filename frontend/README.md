# React + TypeScript + Vite

Этот шаблон даёт минимальную настройку, чтобы React работал в Vite с HMR и некоторыми правилами ESLint.

Сейчас доступны два официальных плагина:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) использует [Babel](https://babeljs.io/) (или [oxc](https://oxc.rs), когда используется в [rolldown-vite](https://vite.dev/guide/rolldown)) для Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) использует [SWC](https://swc.rs/) для Fast Refresh

## React Compiler

React Compiler не включён в этом шаблоне из‑за влияния на производительность разработки и сборки. Как включить — см. [документацию](https://react.dev/learn/react-compiler/installation).

## Расширение конфигурации ESLint

Если вы разрабатываете продакшн‑приложение, рекомендуем обновить конфигурацию, чтобы включить правила линтинга с учётом типов:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Другие конфиги...

      // Уберите tseslint.configs.recommended и замените на это
      tseslint.configs.recommendedTypeChecked,
      // Либо используйте это для более строгих правил
      tseslint.configs.strictTypeChecked,
      // Опционально, добавьте это для стилистических правил
      tseslint.configs.stylisticTypeChecked,

      // Другие конфиги...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // другие опции...
    },
  },
])
```

Также можно установить [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) и [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) для React‑специфичных правил линтинга:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Другие конфиги...
      // Включить правила линтинга для React
      reactX.configs['recommended-typescript'],
      // Включить правила линтинга для React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // другие опции...
    },
  },
])
```
