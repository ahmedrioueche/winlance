import { useI18n } from 'vue-i18n'

import { errorCodeToI18nKey, resolveErrorToastMessage } from './errorMessages'
import { clearToasts, dismissToast, pushToast, toasts, type ToastAction, type ToastKind } from './store'

export function useToast() {
  const { t } = useI18n()

  function errorFromCode(code?: string) {
    pushToast('error', t(errorCodeToI18nKey(code)))
  }

  /** Prefer API validation messages; fall back to translated generic codes. */
  function errorFromUnknown(error: unknown) {
    pushToast('error', resolveErrorToastMessage(error, t))
  }

  function success(messageKey: string, params?: Record<string, unknown>) {
    pushToast('success', params ? t(messageKey, params) : t(messageKey))
  }

  function info(messageKey: string, params?: Record<string, unknown>) {
    pushToast('info', params ? t(messageKey, params) : t(messageKey))
  }

  function errorKey(messageKey: string, params?: Record<string, unknown>) {
    pushToast('error', params ? t(messageKey, params) : t(messageKey))
  }

  function withAction(
    kind: ToastKind,
    message: string,
    action: ToastAction,
    ttlMs = 7_000,
  ) {
    return pushToast(kind, message, ttlMs, action)
  }

  return {
    toasts,
    errorFromCode,
    errorFromUnknown,
    errorKey,
    success,
    info,
    withAction,
    dismiss: dismissToast,
    clear: clearToasts,
  }
}
