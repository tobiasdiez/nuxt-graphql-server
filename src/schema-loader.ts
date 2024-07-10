import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchema as loadGraphqlSchema } from '@graphql-tools/load'
import { GraphQLSchema, printSchema } from 'graphql'

/**
 * Loads the schema from the GraphQL files.
 * @returns the GraphQL schema
 */
export async function loadSchemaFromFiles(
  schemaPointers: string | string[],
  cwd?: string,
): Promise<GraphQLSchema> {
  return await loadGraphqlSchema(schemaPointers, {
    cwd,
    loaders: [new GraphQLFileLoader()],
  })
}

export async function createSchemaImport(
  schemaPointers: string | string[],
  cwd?: string,
): Promise<string> {
  const schema = await loadSchemaFromFiles(schemaPointers, cwd)
  return `
  export const typeDefs = \`${printSchema(schema)}\`
  export const schema = typeDefs
    `
}
