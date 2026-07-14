export type GuidanceType = 'PRICING' | 'NEGOTIATION' | 'FOLLOW_UP' | 'GENERAL'

export type CoachSession = {
  id: string
  guidance_type: GuidanceType | string
  prompt: string
  response: string
  status: string
  created_at: string
}
