import {createLogger, format, transports} from "winston";
import {join} from "path";

export function configureLogger() {
    logger.level = 'info'
    logger.format = format.combine(
        format.splat(),
    )

    logger.add(new transports.File({
        filename: 'electron.log', dirname: join(process.env.USER_DIR, '/logs'),
        format: format.combine(
            format.timestamp({
                format: 'H:mm:ss DD/MM/YYYY',
            }),
            format.json(),
        )
    }))


    if (process.env.NODE_ENV !== 'production') {
        logger.add(new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple(),
            )
        }))
    }
}

export const logger = createLogger();