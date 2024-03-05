import fastify from 'fastify'
import { usersController } from './routes/users/controller'
import { dailyDiet } from './routes/meal/controller'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersController, {
  prefix: 'users',
})

app.register(dailyDiet, {
  prefix: 'mels',
})
