import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import dotenv from "dotenv";
import apiRouter from './route/apiRouter.js'
import { Logger } from "./logger/winstonLogger.js"
import { connectMongo } from "./config/mongo.js"

const log = Logger.getInstance()

try {
    //Getting environment variables
    dotenv.config()

    const app = express()
    const port = String(process.env.PORT) || 3000

    // not disclose technologies used on website 
    app.disable("x-powered-by")
    // Middleware to parse JSON requests in body
    app.use(express.json())

    // Load the OpenAPI specification
    const swaggerDocument = YAML.load('./src/openapi/api_specification.yml')
    // Ensure swaggerDocument is correctly loaded and not undefined
    if (!swaggerDocument) {
        throw new Error('Failed to load Swagger documentation')
    }
    // Serve the API documentation using Swagger UI
    app.use('/openapi', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    //health check endpoint
    app.get('/health', async (req, res) => {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now()
        }
        try {
            res.status(200).send(healthcheck)
        } catch (err) {
            healthcheck.message = err
            log.error(`${err.status || 503} ${res.statusMessage}, ${err.message}`)
            res.status(err.status || 503).send()
        }
    })

    //connect to mongodb
    await connectMongo()

    //use the apiRouter
    app.use('/v1.0', apiRouter)
    
    // Start the server
    app.listen(port, () => {
        log.info(`Azure group sync service running on port ${port}`)
        log.info(`Local OpenAPI documentation available at http://localhost:${port}/openapi`)
    })
} catch (err) {
    log.error(`Something went wrong while starting the server, ${err}`)
    throw new Error(`Something went wrong while starting the server, ${err}`)
}

