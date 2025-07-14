import { syncSecurityGroups } from "../service/groupService.js"
import { Logger } from "../logger/winstonLogger.js"
import {getAuthorizationHeader, verifyAndValidateJWT } from "../validation/headerValidation.js" 
const log = Logger.getInstance()

export const syncGroupsHandler = async (req, res) => {
  // get authorization JWT token and validate it
  try {
    log.info('getting access token from request headers...')
    const accessToken = getAuthorizationHeader(req)
     // validate request authorization JWT token
     await verifyAndValidateJWT(accessToken)
     log.info("Verify access token successfully.")
  } catch (error) {
    log.error(`Missing or invalid access token, ${error.message}`)
    return constructResponse(401, 'Missing or invalid access token')
  }

  try {
    const result = await syncSecurityGroups()
   return constructResponse(200, result)
  } catch (err) {
    log.error(`Sync failed: ${err.message}`)
    return constructResponse(500, 'Failed to sync groups.')
  }
}

const constructResponse = (statusCode, statusMsg) => {
  const responseBody = {
    statuscode: statusCode,
    message: statusMsg
  }
  return responseBody
}
