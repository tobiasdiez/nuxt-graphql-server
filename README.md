# GraphQL Server Toolkit for Nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

This package allows you to easily develop a GraphQL server in your [Nuxt 3](v3.nuxtjs.org) application.

> For consuming a GraphQL API on the client-side, we recommend the modules [Nuxt Apollo](https://apollo.nuxtjs.org/), [Nuxt GraphQL Client](https://nuxt-graphql-client.web.app/) or [nuxt/graphql-client](https://nuxt-graphql-request.vercel.app/).

## Features

- Provides a virtual module `#graphql/schema` from where you can import your schema. Under the hood, it automatically merges multiple schema files together into a complete schema. Moreover, you no longer need to worry about deploying schema `graphql` files.
- Automatically generated typescript definitions for your resolvers via the virtual module `#graphql/resolver`.
- Support for GraphQL subscriptions.
- [Nuxt Devtools](https://devtools.nuxtjs.org) integration: adds the Apollo Studio Sandbox directly in the devtools.

## Installation

```sh
# nuxi
npx nuxi@latest module add graphql-server

# npm
npm install @apollo/server graphql @as-integrations/h3 nuxt-graphql-server

# yarn
yarn add @apollo/server graphql @as-integrations/h3 nuxt-graphql-server

# pnpm
pnpm add @apollo/server graphql @as-integrations/h3 nuxt-graphql-server
```

## Usage

1. If not using `nuxi` for the installation, add the module in `nuxt.config.ts`:

   ```ts
   export default defineNuxtConfig({
     modules: ['nuxt-graphql-server'],
     // Optional top-level config
     graphqlServer: {
       // config
     },
   })

   // or

   export default defineNuxtConfig({
     modules: [
       [
         'nuxt-graphql-server',
         {
           /* Optional inline config */
         },
       ],
     ],
   })
   ```

2. Define the GraphQL schema in `.graphql` files located in the `server` folder.
3. Expose the GraphQL API endpoint by creating `server/api/graphql.ts` with the following content:

   ```ts
   import { Resolvers } from '#graphql/resolver'
   import { typeDefs } from '#graphql/schema'
   import { ApolloServer } from '@apollo/server'
   import { startServerAndCreateH3Handler } from '@as-integrations/h3'

   const resolvers: Resolvers = {
     Query: {
       // Typed resolvers
     },
   }

   const apollo = new ApolloServer({ typeDefs, resolvers })

   export default startServerAndCreateH3Handler(apollo, {
     // Optional: Specify context
     context: (event) => {
       /*...*/
     },
   })
   ```

4. Optionally, specify the (relative) url to the GraphQL endpoint in `nuxt.config.ts` to enable the [Nuxt Devtools](https://devtools.nuxtjs.org) integration.

   <!-- eslint-skip -->

   ```ts
   graphqlServer: {
      url: '/api/graphql',
   }
   ```

## Subscriptions

To enable subscriptions, you need to install a few more dependencies:

```sh
# npm
npm install graphql-ws graphql-subscriptions

# yarn
yarn add graphql-ws graphql-subscriptions

# pnpm
pnpm add graphql-ws graphql-subscriptions
```

The package `graphql-ws` is a lightweight WebSocket server that can be used to handle GraphQL subscriptions. The package `graphql-subscriptions` provides the `PubSub` class that can be used to publish and subscribe to events.

> Note that the default `PubSub` implementation is intended for demo purposes. It only works if you have a single instance of your server and doesn't scale beyond a couple of connections.
> For production usage you'll want to use one of the [PubSub implementations](https://github.com/apollographql/graphql-subscriptions?tab=readme-ov-file#pubsub-implementations) backed by an external store. (e.g. Redis).

Activate websocket support in your `nuxt.config.ts`:

<!-- eslint-skip -->

```ts
nitro: {
  experimental: {
    websocket: true,
  },
},
```

Then, create the endpoint `server/api/graphql.ts` with the following content:

```ts
import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateH3Handler,
  defineGraphqlWebSocket,
} from '@as-integrations/h3'
import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Resolvers } from '#graphql/resolver'
import { typeDefs } from '#graphql/schema'

const resolvers: Resolvers = {
  Query: {
    // Typed resolvers
  },
  Subscription: {
    // Typed resolvers
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
const apollo = new ApolloServer({ schema })
export default startServerAndCreateH3Handler(apollo, {
  websocket: defineGraphqlWebSocket({ schema }),
})
```

A full example can be found in the [playground](./playground) folder under `server/api/subscription.ts`.

## Options

<!-- eslint-skip -->

```ts
graphqlServer: {
  url: '/relative/path/to/your/graphql/endpoint',
  schema: './server/**/*.graphql',
  codegen: {
    maybeValue: T | null | undefined
  }
}
```

### url

Relative url to your GraphQL Endpoint to enable the [Nuxt Devtools](https://devtools.nuxtjs.org) integration.

### schema

A glob pattern on how to locate your GraphQL Schema (`.graphql`) files.

`Default: './server/**/*.graphql'`

### codegen

This module uses [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) under the hood and makes use of the [TypeScript](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript) and [TypeScript Resolvers](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers) plugins which means any options from those plugins can be passed here based on your needs.

For example, you may want to:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-graphql-server'],

  graphqlServer: {
    codegen: {
      // Map your internal enum values to your GraphQL's enums.
      enumValues: '~/graphql/enums/index',

      // Make use of your custom GraphQL Context type and let codegen use it so that the
      // generated resolvers automatically makes use of it.
      contextType: '~/server/graphql/GraphQLContext#GraphQLContext',

      // Change the naming convention of your enum keys
      namingConvention: {
        enumValues: 'change-case-all#constantCase',
      },

      // ... and many more, refer to the plugin docs!
    },
  },
})
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10).
- Install dependencies using `pnpm install`.
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-graphql-server?style=flat-square
[npm-version-href]: https://www.npmjs.com/package/nuxt-graphql-server
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-graphql-server?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxt-graphql-server
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/tobiasdiez/nuxt-graphql-server/ci.yml?branch=main&style=flat-square
[github-actions-href]: https://github.com/tobiasdiez/nuxt-graphql-server/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/tobiasdiez/nuxt-graphql-server/main?style=flat-square
[codecov-href]: https://codecov.io/gh/tobiasdiez/nuxt-graphql-server
