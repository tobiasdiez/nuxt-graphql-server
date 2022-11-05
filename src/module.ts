import {
  addTemplate,
  createResolver,
  defineNuxtModule,
  updateTemplates,
  useLogger,
} from '@nuxt/kit'
import { relative } from 'path'
import { CodeGenConfig, createResolverTypeDefs } from './codegen'
import { createSchemaImport } from './schema-loader'
import multimatch from 'multimatch'

export interface ModuleOptions {
  schema: string | string[]
  codegen?: CodeGenConfig
}

const logger = useLogger('graphql/server')

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'graphql-server',
    configKey: 'graphqlServer',
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

    // Register #graphql/schema virtual module
    const { dst: schemaPath } = addTemplate({
      filename: 'graphql-schema.mjs',
      getContents: () =>
        createSchemaImport(options.schema, nuxt.options.rootDir),
      write: true,
    })
    logger.info(`GraphQL schema registered at ${schemaPath}`)
    nuxt.options.alias['#' + 'graphql/schema'] = schemaPath

    // Create types in build dir
    const { dst: typeDefPath } = addTemplate({
      filename: 'types/graphql-server.d.ts',
      src: resolve('graphql-server.d.ts'),
    })
    const { dst: resolverTypeDefPath } = addTemplate({
      filename: 'types/graphql-server-resolver.d.ts',
      getContents: () => {
        logger.debug('Generating graphql-server-resolver.d.ts')
        return createResolverTypeDefs(
          options.schema,
          options.codegen ?? {},
          nuxt.options.rootDir
        )
      },
    })

    // Add types to `nuxt.d.ts`
    nuxt.hook('prepare:types', ({ tsConfig }) => {
      tsConfig.compilerOptions = tsConfig.compilerOptions || { paths: [] }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access --- seems to be a eslint bug
      tsConfig.compilerOptions.paths['#' + 'graphql/schema'] = [
        relative(nuxt.options.rootDir, typeDefPath),
      ]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access --- seems to be a eslint bug
      tsConfig.compilerOptions.paths['#' + 'graphql/resolver'] = [
        relative(nuxt.options.rootDir, resolverTypeDefPath),
      ]
    })

    // HMR support for schema files
    if (nuxt.options.dev) {
      nuxt.hook('vite:serverCreated', (viteServer, ctx) => {
        //if (ctx.isServer) {
        //}
        nuxt.hook('builder:watch', async (event, path) => {
          if (multimatch(path, options.schema)) {
            logger.debug('schema changed', path)
            //logger.info(viteServer?.moduleGraph)
            //const module = await viteServer?.moduleGraph.getModuleByUrl("#graphql/schema")
            const module = viteServer?.moduleGraph.getModuleById(schemaPath)
            logger.info('module', module)
            if (module) {
              await viteServer?.reloadModule(module)
            }
            await updateTemplates({
              filter: (template) =>
                template.filename.startsWith('types/graphql-server') ||
                template.filename === 'graphql-schema.mjs',
            })
          }
        })
      })
    }
  },
})
