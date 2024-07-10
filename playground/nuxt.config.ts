import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/devtools'],

  graphqlServer: {
    schema: './server/**/*.graphql',
    url: '/api/graphql',
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  compatibilityDate: '2024-07-10',
})
