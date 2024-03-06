import { FastifyInstance } from 'fastify'
import { knex } from '../../database/knexConfig'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function usersController(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const parseUser = z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })

    const { email, password, name } = parseUser.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      email,
      password,
      name,
    })

    return reply
      .status(201)
      .send(JSON.stringify({ menssage: 'user created successfully' }))
  })

  app.get('/', async (request, reply) => {
    const getUsers = await knex('users').select('*')

    return reply.status(200).send(JSON.stringify({ content: getUsers }))
  })

  app.get('/:id', async (request, reply) => {
    const paramsId = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsId.parse(request.params)

    const getUser = await knex('users')
      .where({
        id,
      })
      .first()

    if (!getUser) {
      return reply
        .status(404)
        .send(JSON.stringify({ menssage: 'user not found' }))
    }

    return reply.status(200).send(JSON.stringify({ content: getUser }))
  })

  app.put('/:id', async (request, reply) => {
    const paramsId = z.object({
      id: z.string(),
    })

    const parseUser = z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })

    const { id } = paramsId.parse(request.params)
    const { email, password, name } = parseUser.parse(request.body)

    const getUserId = await knex('users')
      .where({
        id,
      })
      .first()

    const userWithUpdatedEmail = await knex('users')
      .where({
        email,
      })
      .first()

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== getUserId!.id) {
      return reply
        .status(400)
        .send(JSON.stringify({ menssage: 'This email is already in use.' }))
    }

    if (!getUserId) {
      return reply
        .status(404)
        .send(JSON.stringify({ menssage: 'user not found' }))
    }

    await knex('users')
      .where({
        id,
      })
      .update({
        email,
        password,
        name,
      })

    return reply
      .status(200)
      .send(JSON.stringify({ menssage: 'user updated successfully' }))
  })

  app.delete('/:id', async (request, reply) => {
    const paramsId = z.object({
      id: z.string(),
    })

    const { id } = paramsId.parse(request.params)

    const userId = await knex('users')
      .where({
        id,
      })
      .delete()

    if (!userId) {
      return reply
        .status(404)
        .send(JSON.stringify({ menssage: 'user not found' }))
    }

    return reply
      .status(200)
      .send(JSON.stringify({ menssage: 'user deleted successfully' }))
  })
}
