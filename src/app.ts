import fastify from 'fastify'
import { usersController } from './routes/users/controller'

export const app = fastify()

app.register(usersController, {
  prefix: 'users',
})
