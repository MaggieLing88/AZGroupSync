import { Router } from 'express'
import { Logger } from "../logger/winstonLogger.js"
import { syncGroupsHandler } from '../controller/syncContoller.js'

const apiRouter = Router()
const log = Logger.getInstance()

//sync security groups endpoint
apiRouter.get('/securitygroup/sync', async (req, res) => {
  try {
    log.info(`request ${req.url}`)
    const response = await syncGroupsHandler(req, res)
    const statusCode = response.statuscode
    log.info(`responsejson:${JSON.stringify(response)}`)
    res.status(statusCode).json(response.message)
  } catch (error) {
    log.error(`Error occurred: ${error.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default apiRouter