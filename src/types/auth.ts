export type User = {
  id?: unknown
  email?: string | null
  name?: string | null
  firstName?: string | null
  fullName?: string | null
  isAnonymous?: boolean | null
  emailVerified?: boolean | null
  image?: string | null
  avatar?: string | null
  avatarUrl?: string | null
}

export type FetchError = {
  code?: string | undefined
  message?: string | undefined
  status?: number
  statusText?: string
}
