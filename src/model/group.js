import mongoose from "mongoose"

const groupSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  displayName: String,
  mail: String,
  mailEnabled: Boolean,
  securityEnabled: Boolean,
  createdDateTime: String,
}, { timestamps: true })

export const Group = mongoose.model("Group", groupSchema)
