import mongoose from 'mongoose'

const Schema = mongoose.Schema
mongoose.set(`bufferCommands`, false)

const donationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: `User` },
    planId: { type: Schema.Types.ObjectId, ref: `BillingPlan` },
    invoiceNr: String,
    agreementId: String,
    paymentId: String,
    interval: String,
    currency: String,
  },
  {
    timestamps: true,
    // collection: `donations`,
  }
)

export const Donation = mongoose.model(`Donation`, donationSchema)
