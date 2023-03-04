import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

describe('api', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  describe('GetSchema', () => {
    it('returns the schema', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const schema = await $fetch('/api/GetSchema')
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
