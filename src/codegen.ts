import { loadSchemaFromFiles } from './schema-loader'
import * as typescriptPlugin from '@graphql-codegen/typescript'
import { codegen } from '@graphql-codegen/core'
import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers'
import * as typescriptResolversPlugin from '@graphql-codegen/typescript-resolvers'

export type CodeGenConfig = typescriptPlugin.TypeScriptPluginConfig &
  typescriptResolversPlugin.TypeScriptResolversPluginConfig

export async function createResolverTypeDefs(
  schema: string | string[],
  config: CodeGenConfig,
  rootDir: string
) {
  const schemaAsDocumentNode = getCachedDocumentNodeFromSchema(
    await loadSchemaFromFiles(schema, rootDir)
  )
  // Reference: https://the-guild.dev/graphql/codegen/docs/advanced/programmatic-usage
  return await codegen({
    documents: [],
    config,
    filename: 'not used but required',
    schema: schemaAsDocumentNode,
    plugins: [
      {
        typescript: {},
      },
      {
        typescriptResolvers: {},
      },
    ],
    pluginMap: {
      typescript: typescriptPlugin,
      typescriptResolvers: typescriptResolversPlugin,
    },
  })
}
