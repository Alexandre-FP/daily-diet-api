import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(['pg']),
  POSTGRES_PASSWORD: z.string(),
  PORT: z.number().default(3000),
  POSTGRES_USER: z.string(),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('👀 Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data
