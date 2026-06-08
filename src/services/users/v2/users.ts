import { UserV2 } from '../../../schemas/users/v2/users'
import { DB, UserRecord, nextId } from '../shared'

export interface UpdateNamed {
  firstName?: string
  lastName?: string
  email?: string
}

export interface CreateNamed {
  firstName: string
  lastName: string
  email: string
}

export function getUsersV2(): UserV2[] {
  return DB.map(({ id, firstName, lastName, email }) => ({
    id,
    firstName,
    lastName,
    email,
  }))
}

export function updateUserV2(id: string, patch: UpdateNamed): UserV2 | null {
  const record = DB.find((u) => u.id === id)
  if (!record) return null

  if (patch.firstName !== undefined) record.firstName = patch.firstName
  if (patch.lastName !== undefined) record.lastName = patch.lastName
  if (patch.email !== undefined) record.email = patch.email

  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email }
}

export function createUserV2(body: CreateNamed): UserV2 {
  const record: UserRecord = {
    id: nextId(),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    address: { street: '', city: '', country: '' },
  }
  DB.push(record)
  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email }
}
