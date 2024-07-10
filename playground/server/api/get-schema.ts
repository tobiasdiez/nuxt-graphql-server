import { typeDefs } from '#graphql/schema'

// API endpoint that exposes the schema as JSON.
// In production, use introspection instead!
// This is here as demonstration and to easily test HMR.
export default defineEventHandler(() => typeDefs)
