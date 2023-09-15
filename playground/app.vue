<template>
  <h1>GraphQL Playground</h1>
  <h2>Schema:</h2>
  <pre>{{ response }}</pre>
</template>

<script lang="ts" setup>
const response = await $fetch('/api/GetSchema')
</script>
