import fastify from 'fastify'
import { usersController } from './routes/users/controller'
import { mealsController } from './routes/meal/controller'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersController, {
  prefix: 'users',
})

app.register(mealsController, {
  prefix: 'mels',
})
