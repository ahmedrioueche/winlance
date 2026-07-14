type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

function write(level: LogLevel, message: string, meta?: unknown) {
  if (!isDev && level === 'debug') return
  const payload = meta === undefined ? [message] : [message, meta]
  // eslint-disable-next-line no-console
  console[level](...payload)
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
}
