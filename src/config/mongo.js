import mongoose from "mongoose"
import dotenv from "dotenv"
import { Logger } from "../logger/winstonLogger.js"
dotenv.config()
const log = Logger.getInstance()

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    log.info("MongoDB successfully connected.")
  } catch (err) {
    log.error("MongoDB error:", err)
    throw new Error(`MongoDB error: ${err}`)
  }
}
