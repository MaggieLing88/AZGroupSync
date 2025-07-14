import { getGraphClient } from "../config/graphClient.js"
import { Group } from "../model/group.js"
import { Logger } from "../logger/winstonLogger.js"

const MAX_RETRIES = 3;
const log = Logger.getInstance()

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryable = (status) => [429, 500, 502, 503, 504].includes(status)

const fetchWithRetry = async (client, url, attempt = 1) => { //for 1st attempt
  try {
    return await client.api(url).get()
  } catch (err) {
    const status = err.statusCode || err.code || err.response?.status
    log.error(`Error fetching ${url}: ${status}`, err)
    if (isRetryable(status) && attempt <= MAX_RETRIES) { //if status is retryable and attempt is within max retries
      const retryAfter = parseInt(
        err.response?.headers["retry-after"] || "0", //get retry-after header value
        10
      )

      const baseDelay = retryAfter
        ? retryAfter * 1000
        : 1000 * 2 ** attempt + Math.random() * 100 // if retryAfter exist, use it, otherwise, exponential backoff + jitter

      log.warn(`Retrying (${attempt}) in ${baseDelay}ms due to ${status}`)
      await delay(baseDelay)
      return fetchWithRetry(client, url, attempt + 1)
    }

    log.error(`Failed after ${attempt} attempts`, err)
    throw err
  }
}

export const syncSecurityGroups = async () => {
  const client = await getGraphClient()

  let upserted = 0;
  let nextLink =
    `/groups?$filter=securityEnabled eq true&$select=id,displayName,mail,mailEnabled,securityEnabled,createdDateTime`

  try {
    while (nextLink) {
      const result = await fetchWithRetry(client, nextLink)
      const groups = result.value;

      const operations = groups.map((group) => ({
        updateOne: {
          filter: { id: group.id },
          update: { $set: group },
          upsert: true,
        },
      }))

      if (operations.length > 0) {
        const res = await Group.bulkWrite(operations)
        upserted += res.upsertedCount + res.modifiedCount
      }

      nextLink = result["@odata.nextLink"] || null
    }

    return { count: upserted, message: "Groups synchronized successfully." }
  } catch (err) {
    log.error("Error during syncSecurityGroups:", JSON.stringify(err))
    throw err
  }
};
