import { defineNuxtModule } from '@nuxt/kit'
import { createSchemaImport } from './schema-loader'

export interface ModuleOptions {
  schema: string | string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  defaults: {
    schema: './server/**/*.graphql',
  },
  setup(options, nuxt) {
    nuxt.hook('nitro:config', async (nitroConfig) => {
      // Register #graphql/schema virtual module
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#graphql/schema'] = await createSchemaImport(
        options.schema,
        nitroConfig.rootDir
      )
    })
  },
})
