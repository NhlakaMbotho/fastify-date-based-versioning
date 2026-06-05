import { FastifyInstance } from 'fastify'
import { resolveVersion } from '../plugins/dateVersionResolver'
import {
  getUsersV1, getUsersV2, getUsersV3,
  updateUserV1, updateUserV2, updateUserV3,
  createUserV1, createUserV2, createUserV3,
  deleteUser,
  UpdateV1, UpdateV2, UpdateV3,
  CreateV1, CreateV2, CreateV3,
} from '../services/users'
import { userDynamicListSchema, userDynamicUpdateSchema, userDynamicCreateSchema, userDeleteSchema } from '../schemas/users'

const listServiceMap = {
  '2023.01.01': getUsersV1,
  '2024.06.01': getUsersV2,
  '2025.03.01': getUsersV3,
} as const

const updateServiceMap = {
  '2023.01.01': updateUserV1 as (id: string, patch: UpdateV1 | UpdateV2 | UpdateV3) => ReturnType<typeof updateUserV1>,
  '2024.06.01': updateUserV2 as (id: string, patch: UpdateV1 | UpdateV2 | UpdateV3) => ReturnType<typeof updateUserV2>,
  '2025.03.01': updateUserV3 as (id: string, patch: UpdateV1 | UpdateV2 | UpdateV3) => ReturnType<typeof updateUserV3>,
} as const

const createServiceMap = {
  '2023.01.01': createUserV1 as (body: CreateV1 | CreateV2 | CreateV3) => ReturnType<typeof createUserV1>,
  '2024.06.01': createUserV2 as (body: CreateV1 | CreateV2 | CreateV3) => ReturnType<typeof createUserV2>,
  '2025.03.01': createUserV3 as (body: CreateV1 | CreateV2 | CreateV3) => ReturnType<typeof createUserV3>,
} as const

const acceptVersionHeader = {
  type: 'object',
  properties: {
  },
}

export async function userRoutes(app: FastifyInstance) {
  app.get('/api/users', {
    schema: {
      ...userDynamicListSchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'List users',
      operationId: 'listUsers',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined)
    reply.header('X-Api-Version', version)
    return listServiceMap[version]()
  })

  app.patch<{ Params: { id: string }; Body: UpdateV1 & UpdateV2 & UpdateV3 }>('/api/users/:id', {
    schema: {
      ...userDynamicUpdateSchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Update user',
      operationId: 'updateUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined)
    reply.header('X-Api-Version', version)
    const user = updateServiceMap[version](request.params.id, request.body)
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return user
  })

  app.post<{ Body: CreateV1 & CreateV2 & CreateV3 }>('/api/users', {
    schema: {
      ...userDynamicCreateSchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Create user',
      operationId: 'createUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined)
    reply.header('X-Api-Version', version)
    const user = createServiceMap[version](request.body)
    return reply.status(201).send(user)
  })

  app.delete<{ Params: { id: string } }>('/api/users/:id', {
    schema: {
      ...userDeleteSchema,
      headers: acceptVersionHeader,
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Permanently removes a user. Version-agnostic — the `Accept-Version` header is accepted for consistency but does not affect the response.',
      operationId: 'deleteUser',
    },
  }, async (request, reply) => {
    const version = resolveVersion(request.headers['accept-version'] as string | undefined)
    reply.header('X-Api-Version', version)
    const deleted = deleteUser(request.params.id)
    if (!deleted) return reply.status(404).send({ error: 'User not found' })
    return reply.status(204).send()
  })
}
