import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import dotenv from "dotenv";
import { Logger } from "../logger/winstonLogger.js"

dotenv.config();
const log = Logger.getInstance()

const getToken = async () => {

    const res = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials"
        })
    })
    const data = await res.json()
    return data.access_token
}

export const getGraphClient = async () => {
    log.info("getting graph token...")
    try {
        const token = await getToken()
        log.info("Token returned Successfully.")
        return Client.init({
            authProvider: (done) => done(null, token)
        })  
    } catch (error) {
        log.error("Error fetching token,", error)
        throw new Error(`Failed to fetch token, ${error}`)
    }
}
