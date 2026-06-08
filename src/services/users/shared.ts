export interface UserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  address: { street: string; city: string; country: string }
}

export const DB: UserRecord[] = [
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

export function nextId(): string {
  return String(DB.reduce((max, u) => Math.max(max, parseInt(u.id, 10)), 0) + 1)
}

export function deleteUser(id: string): boolean {
  const index = DB.findIndex((u) => u.id === id)
  if (index === -1) return false
  DB.splice(index, 1)
  return true
}
