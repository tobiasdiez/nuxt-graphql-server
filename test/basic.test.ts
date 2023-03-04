import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

describe('api', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  describe('GetSchema', () => {
    it('returns the schema', async () => {
      const schema = await $fetch('/api/GetSchema')
      expect(schema).toMatchInlineSnapshot()
    })
  })
})
