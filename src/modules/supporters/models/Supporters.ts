import mongoose, { Schema, Document } from "mongoose";
import CommonLifeCycleStates from "../../../extras/CommonLifeCycleStates";



export interface ISubscription {
  resourceId: string;
  name: string;
  language: string;
  startDate: Date;
  endDate: Date;
  // status?: CommonLifeCycleStates;
}

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscription: ISubscription[];
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    resourceId: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    language: {
      type: String,
      required: false,
      // trim: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    //  status: {type: Number, required: false ,default: 100},

  },
  { _id: false }
);
const NotificationPrefSchema = new Schema(
  {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    phoneCall: { type: Boolean, default: false },
    postalMail: { type: Boolean, default: false },
  },
);
const PrayerSchemaSchema = new Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    assignee: { type: String, default: '' },
  
  },
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
);
const AddressSchema = new Schema(
  {
    country: { type: String, default: "" },
    district: { type: String, default: "" },
    house: { type: String, default: "" },
    pincode: { type: String, default: "" },
    state: { type: String, default: "" },
    village: { type: String, default: "" },
  },// no separate _id for each address sub-doc
);
const ChildSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String },
    gender: { type: String },
    age: { type: String },
  },
);
const MissionarySchema = new Schema(
  {
    _id: { type: String },
    name: { type: String },
    gender: { type: String },
    age: { type: String },
  },
);
const ContactsSchema = new Schema(
  {
    email: { type: String, default: "" },
    phoneNo: { type: String, default: "" },
    secondaryEmail: { type: String, default: "" },
    secondaryNo: { type: String, default: "" },
  },
   { strict: false, _id: false }
);

const AllocationSchema = new Schema(
  {
    mainPurposeCategory: { type: String, default: "" },
    receiptId: { type: Number, default: 9999 },
    subcategory: { type: String, default: "" },
    tempAmount: { type: String, default: "" },
      sponsorshipAllocationInput: {
        sponsoredTo: { type: String },
        gender: { type: String },
        period: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        children: [ChildSchema],
        missionary: [MissionarySchema],
        transactionId: { type: String },
      },
  },
  { _id: false }
);


const SupporterSchema = new Schema(
  {
    supporterCode: { type: String, require: true },
    status: {type: Number, required: false ,default: 100},
    type: { type: String, default: "Individual" },
    title: { type: String },
    name: { type: String, required: true },
    gender: { type: String },
    preferredLanguages: { type: String },
    meritalStatus: { type: String },
    nationality: { type: String },
    panNo: { type: String },
    passport: { type: String },
    aadhar: { type: String },
    roles: [ {type: Number } ],

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
    family: { type: [FamilySchema], default: [ ] },

    // transaction details — all in same document
    transaction: [{
      sourceOfDonation: { type: String },
      receiptStatus: { type: String },
      transactionCode: { type: String ,default: 'TRANS-0001'},
      transactionId: { type: String},
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

    }],
    prayerRequest: [PrayerSchemaSchema],
    subscription: [SubscriptionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Supporter", SupporterSchema, "supporters");