import { env } from '../env'
import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
    password: env.POSTGRES_PASSWORD,
    user: env.POSTGRES_USER,
    port: 5432,
    database: env.POSTGRES_DB,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
