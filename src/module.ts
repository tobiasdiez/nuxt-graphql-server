import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { relative } from 'path'
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { resolve } = createResolver(import.meta.url)

    nuxt.hook('nitro:config', async (nitroConfig) => {
      // Register #graphql/schema virtual module
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#' + 'graphql/schema'] = await createSchemaImport(
        options.schema,
        nitroConfig.rootDir
      )
    })

    // Create types in build dir
    const { dst: typeDefPath } = addTemplate({
      filename: 'graphql-server.d.ts',
      src: resolve('graphql-server.d.ts'),
    })

    // Add types to `nuxt.d.ts`
    nuxt.hook('prepare:types', ({ references, tsConfig }) => {
      tsConfig.compilerOptions.paths['#' + 'graphql/schema'] = [
        relative(nuxt.options.rootDir, typeDefPath),
      ]
      references.push({ path: 'graphql-server.d.ts' })
    })
  },
})
