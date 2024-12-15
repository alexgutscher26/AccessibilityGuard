import winston from 'winston'

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

export const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  })
}

export const logInfo = (message: string, data?: Record<string, unknown>): void => {
  logger.info({
    message,
    ...data,
  })
}

export const logDebug = (message: string, data?: Record<string, unknown>): void => {
  logger.debug({
    message,
    ...data,
  })
}

export const logWarn = (message: string, data?: Record<string, unknown>): void => {
  logger.warn({
    message,
    ...data,
  })
}
