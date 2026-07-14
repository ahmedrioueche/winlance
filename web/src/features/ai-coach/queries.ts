import {useMutation,useQuery,useQueryClient} from '@tanstack/vue-query'
import {computed,type MaybeRefOrGetter,toValue} from 'vue'
import * as api from './api'
export const aiCoachKeys={all:['ai-coach'] as const,list:['ai-coach','list'] as const,detail:(id:string)=>['ai-coach','detail',id] as const}
export const useSessionsQuery=()=>useQuery({queryKey:aiCoachKeys.list,queryFn:api.fetchSessions});export const useSessionQuery=(id:MaybeRefOrGetter<string>)=>useQuery({queryKey:computed(()=>aiCoachKeys.detail(toValue(id))),queryFn:()=>api.fetchSession(toValue(id))})
function mutation<T, R>(fn:(v:T)=>Promise<R>){const qc=useQueryClient();return useMutation({mutationFn:fn,onSuccess:async()=>{await qc.invalidateQueries({queryKey:aiCoachKeys.all})}})}
export const useCreateSessionMutation=()=>mutation(api.createSession);export const useRegenerateSessionMutation=()=>mutation(api.regenerateSession)
