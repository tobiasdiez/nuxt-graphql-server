import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

describe('api', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  describe('get-schema', () => {
    it('returns the schema', async () => {
      const schema = await $fetch('/api/get-schema')
      expect(schema).toMatchInlineSnapshot(`
        "type Query {
          books: [Book]
        }

        type Book {
          title: String
          author: Author
        }

        type Author {
          name: String
          books: [Book]
        }"
      `)
    })
  })

  describe('graphql', () => {
    it('returns the books', async () => {
      const books = await $fetch('/api/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: '{ books { title } }',
        }),
      })
      expect(books).toMatchInlineSnapshot(`
        {
          "data": {
            "books": [
              {
                "title": "GraphQL with Nuxt",
              },
            ],
          },
        }
      `)
    })
  })
})
