import { FastifyInstance } from 'fastify'
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

const acceptVersionHeader = {
  type: 'object',
  properties: {},
}

export async function userRoutes(app: FastifyInstance) {
  app.get('/api/users', {
    schema: {
      ...listFastifySchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'List users',
      operationId: 'listUsers',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined, API_VERSIONS)
    reply.header('X-Api-Version', version)
    return listServiceMap[version as keyof typeof listServiceMap]()
  })

  app.patch<{ Params: { id: string }; Body: UpdateBasic & UpdateNamed & UpdateAddressed }>('/api/users/:id', {
    schema: {
      ...updateFastifySchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Update user',
      operationId: 'updateUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined, API_VERSIONS)
    reply.header('X-Api-Version', version)
    const user = updateServiceMap[version as keyof typeof updateServiceMap](request.params.id, request.body)
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return user
  })

  app.post<{ Body: CreateBasic & CreateNamed & CreateAddressed }>('/api/users', {
    schema: {
      ...createFastifySchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Create user',
      operationId: 'createUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined, API_VERSIONS)
    reply.header('X-Api-Version', version)
    const user = createServiceMap[version as keyof typeof createServiceMap](request.body)
    return reply.status(201).send(user)
  })

  app.delete<{ Params: { id: string } }>('/api/users/:id', {
    schema: {
      ...deleteFastifySchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Permanently removes a user. Version-agnostic — the `Accept-Version` header is accepted for consistency but does not affect the response.',
      operationId: 'deleteUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined, API_VERSIONS)
    reply.header('X-Api-Version', version)
    const deleted = deleteUser(request.params.id)
    if (!deleted) return reply.status(404).send({ error: 'User not found' })
    return reply.status(204).send()
  })
}
