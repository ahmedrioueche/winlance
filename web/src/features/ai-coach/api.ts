import {apiClient} from '@/shared/api/client'
import type {PaginatedResponse} from '@/shared/types/pagination'
import type {CoachSession,GuidanceType} from './types'
export const fetchSessions=async()=>(await apiClient.get<PaginatedResponse<CoachSession>>('/ai-coach/sessions/')).data
export const fetchSession=async(id:string)=>(await apiClient.get<CoachSession>(`/ai-coach/sessions/${id}/`)).data
export const createSession=async(payload:{guidance_type:GuidanceType;prompt?:string;lead_id?:number;proposal_id?:string;generate?:boolean})=>(await apiClient.post<CoachSession>('/ai-coach/sessions/',payload)).data
export const regenerateSession=async(id:string)=>(await apiClient.post<CoachSession>(`/ai-coach/sessions/${id}/regenerate/`)).data
