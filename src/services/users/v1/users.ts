import { UserV1 } from '../../../schemas/users/v1/users'
import { DB, UserRecord, nextId } from '../shared'

export interface UpdateBasic {
  name?: string
  email?: string
}

export interface CreateBasic {
  name: string
  email: string
}

export function getUsersV1(): UserV1[] {
  return DB.map(({ id, firstName, lastName, email }) => ({
    id,
    name: `${firstName} ${lastName}`,
    email,
  }))
}

export function updateUserV1(id: string, patch: UpdateBasic): UserV1 | null {
  const record = DB.find((u) => u.id === id)
  if (!record) return null

  if (patch.name !== undefined) {
    const [first = '', ...rest] = patch.name.trim().split(' ')
    record.firstName = first
    record.lastName = rest.join(' ')
  }
  if (patch.email !== undefined) record.email = patch.email

  return { id: record.id, name: `${record.firstName} ${record.lastName}`.trim(), email: record.email }
}

export function createUserV1(body: CreateBasic): UserV1 {
  const [first = '', ...rest] = body.name.trim().split(' ')
  const record: UserRecord = {
    id: nextId(),
    firstName: first,
    lastName: rest.join(' '),
    email: body.email,
    address: { street: '', city: '', country: '' },
  }
  DB.push(record)
  return { id: record.id, name: body.name.trim(), email: record.email }
}
