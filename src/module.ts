import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { relative } from 'path'
import { CodeGenConfig, createResolverTypeDefs } from './codegen'
import { createSchemaImport } from './schema-loader'

export interface ModuleOptions {
  schema: string | string[]
  codegen?: CodeGenConfig
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  defaults: {
    schema: './server/**/*.graphql',
    codegen: {
      // Needed for Apollo: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers#integration-with-apollo-server
      useIndexSignature: true,
    },
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
      filename: 'types/graphql-server.d.ts',
      src: resolve('graphql-server.d.ts'),
    })
    const { dst: resolverTypeDefPath } = addTemplate({
      filename: 'types/graphql-server-resolver.d.ts',
      getContents: () =>
        createResolverTypeDefs(
          options.schema,
          options.codegen,
          nuxt.options.rootDir
        ),
    })

    // Add types to `nuxt.d.ts`
    nuxt.hook('prepare:types', ({ tsConfig }) => {
      tsConfig.compilerOptions.paths['#' + 'graphql/schema'] = [
        relative(nuxt.options.rootDir, typeDefPath),
      ]
      tsConfig.compilerOptions.paths['#' + 'graphql/resolver'] = [
        relative(nuxt.options.rootDir, resolverTypeDefPath),
      ]
    })
  },
})
