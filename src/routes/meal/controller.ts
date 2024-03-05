import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/knexConfig'
import { checkSession } from '../../middlewares/checkSession'
import { randomUUID } from 'node:crypto'

export async function dailyDiet(app: FastifyInstance) {
  app.post('/', { preHandler: checkSession }, async (request, reply) => {
    const parseDiet = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
      user_id: z.string(),
    })

    const { name, description, is_on_diet, user_id } = parseDiet.parse(
      request.body,
    )

    reply.cookie('sessionId', user_id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const createdDiety = await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet,
      user_id,
    })

    console.log(createdDiety)

    return reply
      .status(201)
      .send(JSON.stringify({ menssage: 'meal created successfully' }))
  })

  app.get('/', { preHandler: checkSession }, async (request, reply) => {
    const { sessionId } = request.cookies

    const diety = await knex('meals').where({ user_id: sessionId })

    return reply.status(201).send(JSON.stringify({ content: diety }))
  })
}
