import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      builder: "copy",
      input: 'src',
      pattern: 'graphql-server.d.ts',
      outDir: 'dist'
    },
  ]
})
