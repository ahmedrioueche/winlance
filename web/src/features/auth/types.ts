export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated'

export type AuthUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export type AuthTokens = {
  access: string
  refresh: string
}
