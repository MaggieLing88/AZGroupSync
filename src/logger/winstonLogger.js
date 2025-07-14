import winston from 'winston'

export class Logger {
     static instance

     static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    levels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4
    }

    /* This method set the current severity based on the current NODE_ENV: 
 - if the server was run in development mode, show all the log levels
 - if it was run in production, show only warn, error, info and http messages.*/
    level = () => {
        const env = process.env.NODE_ENV || 'development'
        const isDevelopment = env === 'development'
        return isDevelopment ? 'debug' : 'http'
    }

    logger = winston.createLogger({
        level: this.level(),
        levels: this.levels,
        // Use timestamp and printf to create a standard log format
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level.toUpperCase()}: ${message}`
            })
        ),
        // Log to the console
        transports: [
            new winston.transports.Console()
        ],
    })

    info(message) {
        this.logger.info(message)
    }

    error(message) {
        if (message instanceof Error) {
            this.logger.error(message.stack || message.message)
        } else {
            this.logger.error(message)
        }
    }

    debug(message) {
        this.logger.debug(message)
    }

    warn(message) {
        this.logger.warn(message)
    }

    http(messages) {
        this.logger.http(message)
    }

}




