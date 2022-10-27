import { Resolvers } from '#graphql/resolver'
import { schema } from '#graphql/schema'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateH3Handler } from '@as-integrations/h3'

const resolvers: Resolvers = {
  Query: {
    books: () => {
      return [
        {
          title: 'GraphQL with Nuxt',
        },
      ]
    },
  },
}

const apollo = new ApolloServer({ typeDefs: schema, resolvers })

export default startServerAndCreateH3Handler(apollo)
