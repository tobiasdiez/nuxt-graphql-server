// This is an adaption of the "official" example of how to use subscriptions with Apollo server
// https://github.com/apollographql/docs-examples/tree/main/apollo-server/v4/subscriptions-graphql-ws
import { ApolloServer } from '@apollo/server'
import { PubSub } from 'graphql-subscriptions'
import {
  startServerAndCreateH3Handler,
  defineGraphqlWebSocket,
} from '@as-integrations/h3'
import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Resolvers } from '#graphql/resolver'
import { schema } from '#graphql/schema'

// Used to publish subscription events
const pubsub = new PubSub()

// A number that we'll increment over time to simulate subscription events
let currentNumber = 0

// Resolver map
const resolvers: Resolvers = {
  Query: {
    currentNumber() {
      return currentNumber
    },
  },
  Subscription: {
    numberIncremented: {
      // @ts-expect-error: This is a valid resolver
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
    },
  },
}

// Create schema, which will be used separately by ApolloServer and
// the WebSocket server.
const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers })

// Set up ApolloServer.
const apollo = new ApolloServer({
  schema: executableSchema,
})

export default startServerAndCreateH3Handler(apollo, {
  websocket: {
    ...defineGraphqlWebSocket({ schema: executableSchema }),
    error(peer, error) {
      console.error('[ws] error', peer, error)
      // In a real app, you would want to properly log this error
    },
    // For debugging:
    // message(peer, message) {
    //   console.error('[ws] message', peer, message)
    // },
    // open(peer) {
    //   console.error('[ws] open', peer)
    // },
    // upgrade(req) {
    //   console.error('[ws] upgrade', req)
    // },
    // close(peer, details) {
    //   console.error('[ws] close', peer, details)
    // }
  },
})

// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++
  pubsub
    .publish('NUMBER_INCREMENTED', { numberIncremented: currentNumber })
    .catch(console.error)
  setTimeout(incrementNumber, 1000)
}

// Start incrementing
incrementNumber()
