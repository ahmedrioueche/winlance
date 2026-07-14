export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated'

export type AuthUser = {
  id: number | string
  username: string
  email: string
  first_name: string
  last_name: string
  is_email_verified: boolean
  is_demo: boolean
}

export type AuthTokens = {
  access: string
  refresh: string
}
