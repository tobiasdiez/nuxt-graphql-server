<template>
  <h1>GraphQL Playground</h1>
  <h2>Schema:</h2>
  <pre>{{ schema }}</pre>
</template>

<script lang="ts" setup>
import { schema } from '#graphql/schema'
</script>
