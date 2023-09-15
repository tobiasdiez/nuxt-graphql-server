<template>
  <h1>GraphQL Playground</h1>
  <h2>Schema:</h2>
  <pre>{{ schema }}</pre>
</template>

<script lang="ts" setup>
const schema = await $fetch('/api/GetSchema')
</script>
