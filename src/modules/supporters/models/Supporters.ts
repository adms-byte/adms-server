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
const FamilySchema = new Schema(
  {
    dateOfBirth: { type: Date },
    email: { type: String, default: "" },
    language: { type: String, default: "" },
    name: { type: String, default: "" },
    occupation: { type: String, default: "" },
    phoneNo: { type: String, default: "" },
    relationType: {
      type: String,
      enum: ["spouse", "child", "relative"], // matches your dropdown options
      default: "spouse",
    },
  },
  { _id: false },
);
const AddressSchema = new Schema(
  {
    country: { type: String, default: "" },
    district: { type: String, default: "" },
    house: { type: String, default: "" },
    pincode: { type: String, default: "" },
    state: { type: String, default: "" },
    village: { type: String, default: "" },
  },
  { _id: false }, // no separate _id for each address sub-doc
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
const ContactsSchema = new Schema(
  {
    // dynamic keys like "address-1", "address-2", "address-3"...
    address: {
      type: Map,
      of: AddressSchema,
      default: {},
    },
    email: { type: String, default: "" },
    phoneNo: { type: String, default: "" },
    secondaryEmail: { type: String, default: "" },
    secondaryNo: { type: String, default: "" },
  },
  { _id: false },
);

const AllocationSchema = new Schema(
  {
    mainPurposeCategory: { type: String, default: "" },
    subcategory: { type: String, default: "" },
    tempAmount: { type: String, default: "" },
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
  { _id: false }
);



const SupporterSchema = new Schema(
  {
    type: { type: String, default: "Individual" },
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
    // generalCommunication: NotificationPrefSchema,
    // receiptAcknowledgement: NotificationPrefSchema,
    acknowledgement: {
      weddingWishes: NotificationPrefSchema,
      birthdayWishes: NotificationPrefSchema,
      generalCommunication: NotificationPrefSchema,
      receiptAcknowledgement: NotificationPrefSchema,
    },
    contacts: { type: ContactsSchema, default: {} },
    family: { type: FamilySchema, default: {} },

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

    
    },
  },
  { timestamps: true }
);

export default mongoose.model("Supporter", SupporterSchema, "supporters");