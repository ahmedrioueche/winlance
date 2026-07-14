export type Permission =
  | 'lead:read'
  | 'lead:write'
  | 'project:read'
  | 'project:write'
  | 'project:delete'

export const permissions = [
  'lead:read',
  'lead:write',
  'project:read',
  'project:write',
  'project:delete',
] as const satisfies readonly Permission[]
