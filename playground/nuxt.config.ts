import { defineNuxtConfig } from 'nuxt/config'
import GraphqlServerModule from '..'

export default defineNuxtConfig({
  modules: [GraphqlServerModule, '@nuxt/devtools'],
  graphqlServer: {
    schema: './server/**/*.graphql',
    url: '/api/graphql',
  },
})
