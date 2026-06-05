import { UserV1, UserV2, UserV3 } from '../schemas/users'

interface UserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  address: { street: string; city: string; country: string }
}

// Partial update shapes per version — mirror what each version's body schema accepts
export interface UpdateV1 {
  name?: string
  email?: string
}

export interface UpdateV2 {
  firstName?: string
  lastName?: string
  email?: string
}

export interface UpdateV3 {
  firstName?: string
  lastName?: string
  email?: string
  address?: Partial<UserRecord['address']>
}

const DB: UserRecord[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    address: { street: '12 Oak Ave', city: 'Cape Town', country: 'ZA' },
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    address: { street: '5 Pine Rd', city: 'Johannesburg', country: 'ZA' },
  },
]

// Each service function shapes the internal record to match the version's schema.
// This is the key pattern: one DB, multiple projections.

export function getUsersV1(): UserV1[] {
  return DB.map(({ id, firstName, lastName, email }) => ({
    id,
    name: `${firstName} ${lastName}`, // collapsed back into single field
    email,
  }))
}

export function getUsersV2(): UserV2[] {
  return DB.map(({ id, firstName, lastName, email }) => ({
    id,
    firstName,
    lastName,
    email,
  }))
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

// ── Update functions ─────────────────────────────────────────────────────────

export function updateUserV1(id: string, patch: UpdateV1): UserV1 | null {
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

export function updateUserV2(id: string, patch: UpdateV2): UserV2 | null {
  const record = DB.find((u) => u.id === id)
  if (!record) return null

  if (patch.firstName !== undefined) record.firstName = patch.firstName
  if (patch.lastName !== undefined) record.lastName = patch.lastName
  if (patch.email !== undefined) record.email = patch.email

  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email }
}

export function updateUserV3(id: string, patch: UpdateV3): UserV3 | null {
  const record = DB.find((u) => u.id === id)
  if (!record) return null

  if (patch.firstName !== undefined) record.firstName = patch.firstName
  if (patch.lastName !== undefined) record.lastName = patch.lastName
  if (patch.email !== undefined) record.email = patch.email
  if (patch.address !== undefined) record.address = { ...record.address, ...patch.address }

  return { id: record.id, firstName: record.firstName, lastName: record.lastName, email: record.email, address: record.address }
}

// ── Create interfaces ─────────────────────────────────────────────────────────

export interface CreateV1 {
  name: string
  email: string
}

export interface CreateV2 {
  firstName: string
  lastName: string
  email: string
}

export interface CreateV3 {
  firstName: string
  lastName: string
  email: string
  address: { street: string; city: string; country: string }
}

// ── Create functions ──────────────────────────────────────────────────────────

function nextId(): string {
  return String(DB.reduce((max, u) => Math.max(max, parseInt(u.id, 10)), 0) + 1)
}

export function createUserV1(body: CreateV1): UserV1 {
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

export function createUserV2(body: CreateV2): UserV2 {
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

export function createUserV3(body: CreateV3): UserV3 {
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

// ── Delete function ───────────────────────────────────────────────────────────

export function deleteUser(id: string): boolean {
  const index = DB.findIndex((u) => u.id === id)
  if (index === -1) return false
  DB.splice(index, 1)
  return true
}
