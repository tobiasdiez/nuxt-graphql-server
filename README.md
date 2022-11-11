# GraphQL Server Toolkit for Nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

This package allows you to easily develop a GraphQL server in your [nuxt](v3.nuxtjs.org) application.

## Features

- Provides a virtual module `#graphql/schema` from where you can import your schema. Under the hood, it automatically merges multiple schema files together into a complete schema. Moreover, you no longer need to worry about deploying schema `graphql` files.
- Automatically generates typescript definitions for your resolvers.

## Installation

```sh
# npm
npm install @apollo/server graphql @as-integrations/h3 nuxt-graphql-server

# yarn
yarn add @apollo/server graphql @as-integrations/h3 nuxt-graphql-server

# pnpm
pnpm add @apollo/server graphql @as-integrations/h3 nuxt-graphql-server
```

## Usage

1. Add the module in `nuxt.config.ts`:

   ```ts
   export default defineNuxtConfig({
      modules: [
         'nuxt-graphql-server'
      ],
      graphqlServer: {
         // Optional: config
      }
   })
   ̀ ``

   ```

2. Define the GraphQL schema in `.graphql` files located in the `server` folder.
3. Expose the GraphQL API endpoint by creating `server/api/graphql.ts` with the following content:

   ```ts
   import { Resolvers } from '#graphql/resolver'
   import { schema } from '#graphql/schema'
   import { ApolloServer } from '@apollo/server'
   import { startServerAndCreateH3Handler } from '@as-integrations/h3'

   const resolvers: Resolvers = {
      Query: {
         // Typed resolvers
      },
   }

   const apollo = new ApolloServer({typeDefs: schema, resolvers})

   export default startServerAndCreateH3Handler(apollo, {
      // Optional: Specify context
      context: (event) => {...},
   })
   ```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10).
- Install dependencies using `pnpm install --shamefully-hoist`.
- - Run `pnpm run prepare` to generate type stubs.
- Use `pnpm run dev` to start [playground](./playground) in development mode.

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-graphql-server?style=flat-square
[npm-version-href]: https://www.npmjs.com/package/nuxt-graphql-server
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-graphql-server?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxt-graphql-server
[github-actions-src]: https://img.shields.io/github/workflow/status/tobiasdiez/nuxt-graphql-server/ci/main?style=flat-square
[github-actions-href]: https://github.com/tobiasdiez/nuxt-graphql-server/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/tobiasdiez/nuxt-graphql-server/main?style=flat-square
[codecov-href]: https://codecov.io/gh/tobiasdiez/nuxt-graphql-server
