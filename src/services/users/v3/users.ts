import { UserV3 } from '../../../schemas/users/v3/users'
import { DB, UserRecord, nextId } from '../shared'

export interface UpdateAddressed {
  firstName?: string
  lastName?: string
  email?: string
  address?: Partial<{ street: string; city: string; country: string }>
}

export interface CreateAddressed {
  firstName: string
  lastName: string
  email: string
  address: { street: string; city: string; country: string }
}

export function getUsersV3(): UserV3[] {
  return DB.map(({ id, firstName, lastName, email, address }) => ({
    id,
    firstName,
    lastName,
    email,
    address,
  }))
}

export function updateUserV3(id: string, patch: UpdateAddressed): UserV3 | null {
  const record = DB.find((u) => u.id === id)
  if (!record) return null

  if (patch.firstName !== undefined) record.firstName = patch.firstName
  if (patch.lastName !== undefined) record.lastName = patch.lastName
  if (patch.email !== undefined) record.email = patch.email
  if (patch.address !== undefined) record.address = { ...record.address, ...patch.address }

  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email, address: record.address }
}

export function createUserV3(body: CreateAddressed): UserV3 {
  const record: UserRecord = {
    id: nextId(),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    address: body.address,
  }
  DB.push(record)
  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email, address: record.address }
}
