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
import { resolve as resolvePath } from 'path'
import { Nuxt } from '@nuxt/schema'
import { pathToFileURL } from 'url'

export interface ModuleOptions {
  schema: string | string[]
  codegen?: CodeGenConfig
  url?: string
}

const logger = useLogger('graphql/server')

function setAlias(nuxt: Nuxt, alias: string, path: string) {
  // workaround for https://github.com/nuxt/nuxt/issues/19453
  if (process.env.NODE_ENV === 'development') {
    // rollup needs a file URL
    nuxt.options.alias[alias] = pathToFileURL(
      resolvePath(nuxt.options.buildDir, path)
    ).href

    // vite needs a path
    nuxt.hooks.hook('vite:extendConfig', (config) => {
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...config.resolve.alias,
        [alias]: path,
      }
    })
  } else {
    nuxt.options.alias[alias] = path
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-graphql-server',
    configKey: 'graphqlServer',
  },
  defaults: {
    schema: './server/**/*.graphql',
    codegen: {
      // Needed for Apollo: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers#integration-with-apollo-server
      useIndexSignature: true,
    },
    url: undefined,
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
    logger.debug(`GraphQL schema registered at ${schemaPath}`)
    setAlias(nuxt, '#graphql/schema', schemaPath)

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
      tsConfig.compilerOptions.paths['#graphql/schema'] = [
        relative(nuxt.options.rootDir, typeDefPath),
      ]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access --- seems to be a eslint bug
      tsConfig.compilerOptions.paths['#graphql/resolver'] = [
        relative(nuxt.options.rootDir, resolverTypeDefPath),
      ]
    })

    // HMR support for schema files
    if (nuxt.options.dev) {
      nuxt.hook('nitro:build:before', (nitro) => {
        nuxt.hook('builder:watch', async (event, path) => {
          if (multimatch(path, options.schema)) {
            logger.debug('Schema changed', path)

            // Update templates
            await updateTemplates({
              filter: (template) =>
                template.filename.startsWith('types/graphql-server') ||
                template.filename === 'graphql-schema.mjs',
            })

            // Reload nitro dev server
            // Until https://github.com/nuxt/framework/issues/8720 is implemented, this is the best we can do
            await nitro.hooks.callHook('dev:reload')
          }
        })
      })
    }

    // Add custom devtools tab
    if (options.url) {
      // @ts-expect-error: no type info yet
      nuxt.hook('devtools:customTabs', (tabs) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        tabs.push({
          name: 'graphql-server',
          title: 'GraphQL server',
          icon: 'simple-icons:graphql',
          view: { type: 'iframe', src: options.url },
        })
      })
    }
  },
})
