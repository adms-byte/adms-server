import mongoose, { Schema, Document } from "mongoose";

const NotificationPrefSchema = new Schema(
  {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    phoneCall: { type: Boolean, default: false },
    postalMail: { type: Boolean, default: false },
  },
  { _id: false }
);

const AllocationSchema = new Schema(
  {
    mainPurposeCategory: { type: String, default: "" },
    subcategory: { type: String, default: "" },
    tempAmount: { type: String, default: "" },
  },
  { _id: false }
);

const ChildSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String },
    gender: { type: String },
    age: { type: String },
  },
  { _id: false }
);

const SupporterSchema = new Schema(
  {
    type: { type: String, default: "Individual" }, // "Individual" | "Organisation"
    title: { type: String },
    name: { type: String, required: true },
    gender: { type: String },
    language: { type: String },
    meritalStatus: { type: String },
    nationality: { type: String },
    panNo: { type: String },
    passport: { type: String },
    aadhar: { type: String },

    roles: [
      {
        label: { type: String },
        _id: false,
      },
    ],

    // notification preferences
    birthdayWishes: NotificationPrefSchema,
    generalCommunication: NotificationPrefSchema,
    receiptAcknowledgement: NotificationPrefSchema,
    weddingWishes: NotificationPrefSchema,
    acknowledgement: {
      generalCommunication: NotificationPrefSchema,
      receiptAcknowledgement: NotificationPrefSchema,
    },

    // transaction details — all in same document
    transaction: {
      sourceOfDonation: { type: String },
      amount: { type: String },
      amountCreditBank: { type: String },
      amountDepositDate: { type: Date },
      balanceAmount: { type: String },
      chalanDate: { type: Date },
      creditPerson: { type: String },
      onlinePaymentType: { type: String },
      paymentMode: { type: String },

      allocation: [AllocationSchema],
      allocationInput: AllocationSchema,

      sponsorshipAllocationInput: {
        sponsoredTo: { type: String },
        gender: { type: String },
        period: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        children: [ChildSchema],
        transactionId: { type: String },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Supporter", SupporterSchema, "supporters");