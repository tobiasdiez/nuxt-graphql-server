import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/devtools'],

  graphqlServer: {
    schema: './server/**/*.graphql',
    url: '/api/graphql',
  },

  compatibilityDate: '2024-07-10',
})