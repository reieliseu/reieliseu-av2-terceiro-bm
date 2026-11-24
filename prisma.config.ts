import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Generation only needs the schema; database commands still require a real URL.
    url: process.env.DATABASE_URL,
  },
})
