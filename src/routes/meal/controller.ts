import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/knexConfig'
import { checkSession } from '../../middlewares/checkSession'
import { randomUUID } from 'node:crypto'

export async function mealsController(app: FastifyInstance) {
  app.post('/', { preHandler: checkSession }, async (request, reply) => {
    const parseDiet = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
    })

    const { name, description, is_on_diet } = parseDiet.parse(request.body)

    const sessionIdParse = z.object({
      sessionId: z.string(),
    })

    const { sessionId } = sessionIdParse.parse(request.cookies)

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const createdDiety = await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet,
      user_id: sessionId,
    })

    return reply
      .status(201)
      .send(JSON.stringify({ menssage: 'meal created successfully' }))
  })

  app.get('/', { preHandler: checkSession }, async (request, reply) => {
    const { sessionId } = request.cookies

    const diety = await knex('meals').where({ user_id: sessionId })

    return reply.status(201).send(JSON.stringify({ content: diety }))
  })

  app.get('/:id', { preHandler: checkSession }, async (request, reply) => {
    const parseIdDiety = z.object({
      id: z.string().uuid(),
    })

    const { id } = parseIdDiety.parse(request.params)

    const { sessionId } = request.cookies

    const diety = await knex('meals')
      .where({
        id,
        user_id: sessionId,
      })
      .first()

    if (diety?.user_id !== sessionId) {
      return reply.status(409).send(
        JSON.stringify({
          menssage: 'Diet cannot be viewed by a different user.',
        }),
      )
    }

    return reply.status(201).send(JSON.stringify({ content: diety }))
  })

  app.put('/:id', { preHandler: checkSession }, async (request, reply) => {
    const parseIdDiety = z.object({
      id: z.string().uuid(),
    })

    const { id } = parseIdDiety.parse(request.params)

    const existIdDiet = await knex('meals')
      .where({
        id,
      })
      .first()

    if (!existIdDiet) {
      return reply
        .status(409)
        .send(JSON.stringify({ menssage: 'Diet not found' }))
    }

    const { sessionId } = request.cookies

    if (existIdDiet?.user_id !== sessionId) {
      return reply.status(409).send(
        JSON.stringify({
          menssage: 'Diet cannot be edited by a different user.',
        }),
      ) 
    }

    const parseDiet = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
    })

    const { name, description, is_on_diet } = parseDiet.parse(request.body)

    await knex('meals').update({
      name,
      description,
      is_on_diet,
    })

    return reply
      .status(201)
      .send(JSON.stringify({ menssage: 'Diet uptaded successfully' }))
  })

  app.delete('/:id', async (req, reply) => {
    const parseId = z.object({
      id: z.string(),
    })

    const { id } = parseId.parse(req.params)
    const { sessionId } = req.cookies

    const deleteDiet = await knex('meals')
      .where({
        id,
      })
      .first()

    if (!deleteDiet) {
      return reply
        .status(404)
        .send(JSON.stringify({ menssage: 'Diet not found' }))
    }

    if (deleteDiet?.user_id !== sessionId) {
      return reply.status(409).send(
        JSON.stringify({
          menssage: 'Diet cannot be edited by a different user.',
        }),
      )
    }

    await knex('meals')
      .where({
        id,
      })
      .delete()

    return reply
      .status(200)
      .send(JSON.stringify({ menssage: 'Diet successfully excluded' }))
  })

  app.get('/metrics', { preHandler: checkSession }, async (request, reply) => {
    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: request.cookies.sessionId, is_on_diet: true })
      .count('id', { as: 'total' })
      .first()

    const totalMealsOffDiet = await knex('meals')
      .where({ user_id: request.cookies.sessionId, is_on_diet: false })
      .count('id', { as: 'total' })
      .first()

    const totalMeals = await knex('meals')
      .where({ user_id: request.cookies.sessionId })
      .orderBy('created_at', 'desc')

    const { bestOnDietSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.is_on_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return reply.send({
      totalMeals: totalMeals.length,
      totalMealsOnDiet: totalMealsOnDiet?.total,
      totalMealsOffDiet: totalMealsOffDiet?.total,
      bestOnDietSequence,
    })
  })
}
