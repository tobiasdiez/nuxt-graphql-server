import unjs from 'eslint-config-unjs'
import prettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'

export default unjs(
  {
    plugins: [unusedImports],
    ignores: ['**/.nuxt', '**/.output'],
  },
  prettier,
)
