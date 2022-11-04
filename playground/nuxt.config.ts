import { defineNuxtConfig } from 'nuxt/config'
import GraphqlServerModule from '..'

export default defineNuxtConfig({
  modules: [GraphqlServerModule],
  graphqlServer: {
    schema: './server/**/*.graphql',
  },
})
