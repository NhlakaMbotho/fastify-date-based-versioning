import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { resolveVersion } from '../plugins/dateVersionResolver'
import {
  getUsersV1, getUsersV2, getUsersV3,
  updateUserV1, updateUserV2, updateUserV3,
  createUserV1, createUserV2, createUserV3,
  deleteUser,
  UpdateBasic, UpdateNamed, UpdateAddressed,
  CreateBasic, CreateNamed, CreateAddressed,
} from '../services/users'
import {
  API_VERSIONS,
  userIdParamsZodSchema,
  acceptVersionHeaderZodSchema,
  createBodyZodSchema,
  updateBodyZodSchema,
  listFastifySchema,
  createFastifySchema,
  updateFastifySchema,
  deleteFastifySchema,
} from '../schemas/users'

const listServiceMap = {
  '2023.01.01': getUsersV1,
  '2024.06.01': getUsersV2,
  '2025.03.01': getUsersV3,
} as const

const updateServiceMap = {
  '2023.01.01': updateUserV1 as (id: string, patch: UpdateBasic | UpdateNamed | UpdateAddressed) => ReturnType<typeof updateUserV1>,
  '2024.06.01': updateUserV2 as (id: string, patch: UpdateBasic | UpdateNamed | UpdateAddressed) => ReturnType<typeof updateUserV2>,
  '2025.03.01': updateUserV3 as (id: string, patch: UpdateBasic | UpdateNamed | UpdateAddressed) => ReturnType<typeof updateUserV3>,
} as const

const createServiceMap = {
  '2023.01.01': createUserV1 as (body: CreateBasic | CreateNamed | CreateAddressed) => ReturnType<typeof createUserV1>,
  '2024.06.01': createUserV2 as (body: CreateBasic | CreateNamed | CreateAddressed) => ReturnType<typeof createUserV2>,
  '2025.03.01': createUserV3 as (body: CreateBasic | CreateNamed | CreateAddressed) => ReturnType<typeof createUserV3>,
} as const

export async function userRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get('/api/users', {
    schema: {
      ...listFastifySchema,
      headers: acceptVersionHeaderZodSchema,
      tags: ['Users'],
      summary: 'List users',
      operationId: 'listUsers',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'], API_VERSIONS)
    reply.header('X-Api-Version', version)
    return listServiceMap[version as keyof typeof listServiceMap]()
  })

  typedApp.patch('/api/users/:id', {
    schema: {
      ...updateFastifySchema,
      params: userIdParamsZodSchema,
      body: updateBodyZodSchema,
      headers: acceptVersionHeaderZodSchema,
      tags: ['Users'],
      summary: 'Update user',
      operationId: 'updateUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'], API_VERSIONS)
    reply.header('X-Api-Version', version)
    const user = updateServiceMap[version as keyof typeof updateServiceMap](
      request.params.id,
      request.body as UpdateBasic | UpdateNamed | UpdateAddressed,
    )
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return user
  })

  typedApp.post('/api/users', {
    schema: {
      ...createFastifySchema,
      body: createBodyZodSchema,
      headers: acceptVersionHeaderZodSchema,
      tags: ['Users'],
      summary: 'Create user',
      operationId: 'createUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'], API_VERSIONS)
    reply.header('X-Api-Version', version)
    const user = createServiceMap[version as keyof typeof createServiceMap](
      request.body as CreateBasic | CreateNamed | CreateAddressed,
    )
    return reply.status(201).send(user)
  })

  typedApp.delete('/api/users/:id', {
    schema: {
      ...deleteFastifySchema,
      params: userIdParamsZodSchema,
      headers: acceptVersionHeaderZodSchema,
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Permanently removes a user. Version-agnostic — the `Accept-Version` header is accepted for consistency but does not affect the response.',
      operationId: 'deleteUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'], API_VERSIONS)
    reply.header('X-Api-Version', version)
    const deleted = deleteUser(request.params.id)
    if (!deleted) return reply.status(404).send({ error: 'User not found' })
    return reply.status(204).send()
  })
}
