/**
 * Donor Management System — Mongoose + TypeScript Schemas
 * Covers: Profile, Contact, Family Details, Preferences,
 *         Transactions (Chalan), Receipt & Purpose Allocation, Sponsorship
 *
 * Install: npm install mongoose
 *          npm install -D @types/mongoose
 */

import mongoose, { Document, Schema, Model, model } from "mongoose";

// ─────────────────────────────────────────────────────────────
// 0.  Enums
// ─────────────────────────────────────────────────────────────

export enum PersonType {
  Person       = "Person",
  Organization = "Organization",
  Anonymous    = "Anonymous",
}

export enum Title {
  Mr   = "Mr",
  Mrs  = "Mrs",
  Ms   = "Ms",
  Dr   = "Dr",
  Rev  = "Rev",
  Prof = "Prof",
}

export enum Gender {
  Male           = "Male",
  Female         = "Female",
  Other          = "Other",
  PreferNotToSay = "Prefer not to say",
}

export enum MaritalStatus {
  Single    = "Single",
  Married   = "Married",
  Divorced  = "Divorced",
  Widowed   = "Widowed",
  Separated = "Separated",
}

export enum RelationType {
  Spouse   = "Spouse",
  Child    = "Child",
  Parent   = "Parent",
  Sibling  = "Sibling",
  Relative = "Relative",
  Guardian = "Guardian",
  Other    = "Other",
}

export enum Occupation {
  Student      = "Student",
  Employed     = "Employed",
  SelfEmployed = "Self-Employed",
  Homemaker    = "Homemaker",
  Retired      = "Retired",
  Unemployed   = "Unemployed",
  Other        = "Other",
}

export enum Currency {
  INR = "INR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  SGD = "SGD",
}

export enum SourceOfDonation {
  Local = "Local",
  FCRA  = "FCRA",
}

export enum ModeOfPayment {
  Cash        = "Cash",
  Cheque      = "Cheque",
  NEFT        = "NEFT",
  RTGS        = "RTGS",
  UPI         = "UPI",
  DemandDraft = "Demand Draft",
  Online      = "Online",
  Other       = "Other",
}

export enum CreditPersonType {
  Same      = "Same",
  Different = "Different",
}

export enum SponsoredTo {
  Child   = "Child",
  Student = "Student",
  Elder   = "Elder",
  Family  = "Family",
  Other   = "Other",
}

export enum SponsorshipPeriod {
  Monthly    = "Monthly",
  Quarterly  = "Quarterly",
  HalfYearly = "Half-Yearly",
  Annually   = "Annually",
  OneTime    = "One-Time",
}

/**
 * Purpose category master list visible in the UI dropdown.
 * e.g. "Education, Training & Development", "Child", etc.
 * Store these in a separate PurposeCategory collection for dynamic admin management.
 */
export enum MainPurposeCategory {
  EducationTrainingDevelopment = "Education, Training & Development",
  Child                        = "Child",
  Health                       = "Health",
  Community                    = "Community",
  Emergency                    = "Emergency Relief",
  ChurchMinistry               = "Church & Ministry",
  Other                        = "Other",
}

/**
 * Subcategory map — what the UI shows once a Main Category is selected.
 * Example from image: "Education, Training & Development" → "Higher Education of Pastors"
 */
export const PurposeSubcategoryMap: Record<MainPurposeCategory, string[]> = {
  [MainPurposeCategory.EducationTrainingDevelopment]: [
    "Higher Education of Pastors",
    "Leaders Training Program",
    "School Fees Support",
    "Vocational Training",
  ],
  [MainPurposeCategory.Child]: [
    "Support for Children's Home",
    "Child Nutrition",
    "Child Healthcare",
    "Child Education",
  ],
  [MainPurposeCategory.Health]: [
    "Medical Camp",
    "Medicine Support",
    "Hospital Bills",
  ],
  [MainPurposeCategory.Community]: [
    "Community Development",
    "Water & Sanitation",
    "Rural Empowerment",
  ],
  [MainPurposeCategory.Emergency]: [
    "Flood Relief",
    "Disaster Relief",
    "Food Distribution",
  ],
  [MainPurposeCategory.ChurchMinistry]: [
    "Church Building",
    "Evangelism",
    "Bible Distribution",
  ],
  [MainPurposeCategory.Other]: ["General Fund", "Unspecified"],
};

// ─────────────────────────────────────────────────────────────
// 1.  Shared sub-document interfaces & schemas
// ─────────────────────────────────────────────────────────────

// ── 1a. Address ──────────────────────────────────────────────
export interface IAddress {
  houseName? : string;
  village?   : string;
  pinCode?   : string;
  district?  : string;
  state?     : string;
  country    : string;
}

const AddressSchema = new Schema<IAddress>(
  {
    houseName : { type: String, trim: true },
    village   : { type: String, trim: true },
    pinCode   : { type: String, trim: true, match: [/^\d{4,10}$/, "Invalid pin code"] },
    district  : { type: String, trim: true },
    state     : { type: String, trim: true },
    country   : { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

// ── 1b. Acknowledgement Channel ──────────────────────────────
export interface IAcknowledgementChannel {
  email            : boolean;
  phoneCall        : boolean;
  postalMail       : boolean;
  whatsApp         : boolean;
  noAcknowledgment : boolean;
}

const AcknowledgementChannelSchema = new Schema<IAcknowledgementChannel>(
  {
    email            : { type: Boolean, default: false },
    phoneCall        : { type: Boolean, default: false },
    postalMail       : { type: Boolean, default: false },
    whatsApp         : { type: Boolean, default: false },
    noAcknowledgment : { type: Boolean, default: false },
  },
  { _id: false }
);

// ── 1c. Credit Person Details ────────────────────────────────
export interface ICreditPersonDetails {
  name     : string;
  donorId? : string;
}

const CreditPersonDetailsSchema = new Schema<ICreditPersonDetails>(
  {
    name    : { type: String, required: false, trim: true },
    donorId : { type: String, trim: true },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// 2.  Receipt & Purpose Allocation  (updated from new image)
//
//  The modal has TWO logical layers:
//    A) Receipt header  — receiptDate, amountTotal  (one per receipt)
//    B) Allocation rows — mainCategory + subcategory + amount  (many per receipt)
//       Shown in the table: Main Category | Subcategory | Amount
//
//  We model this as:
//    IChalanEntry.receipts[]   ← array of IReceipt (one per "Save Allocation")
//    IReceipt.allocationLines[]← the rows in the table
// ─────────────────────────────────────────────────────────────

/**
 * One row in the "Main Category / Subcategory / Amount" table.
 * Added via "Add Allocation" button.
 * Examples from image:
 *   child       | Support for Children's Home  | 111
 *   education   | Leaders Training Program      |  11
 */
export interface IAllocationLine {
  mainCategory : string;   // MainPurposeCategory value or free text
  subcategory? : string;   // sub-option of mainCategory
  amount       : number;
}

const AllocationLineSchema = new Schema<IAllocationLine>(
  {
    mainCategory : { type: String, required: false, trim: true },
    subcategory  : { type: String, trim: true },
    amount       : { type: Number, required: false, min: 0 },
  },
  { _id: false }
);

/**
 * One "Receipt & Purpose Allocation" modal submission.
 *  - receiptDate   : the date field at the top of the modal
 *  - amountTotal   : the read-only total shown (matches chalan amount)
 *  - lines         : the rows built up with "Add Allocation" button
 *
 * Validation: sum of lines[].amount should equal amountTotal (enforced in pre-save).
 */
export interface IReceipt {
  receiptDate  : Date;
  amountTotal  : number;
  lines        : IAllocationLine[];
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    receiptDate : { type: Date, required: false },
    amountTotal : { type: Number, required: false, min: 0 },
    lines       : { type: [AllocationLineSchema], default: [] },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────
// 3.  Section sub-document interfaces & schemas
// ─────────────────────────────────────────────────────────────

// ── 3a. Profile ──────────────────────────────────────────────
export interface IProfile {
  pictureUrl?    : string;
  type           : PersonType;
  title?         : Title;
  roles          : string[];
  fullName       : string;
  nationality?   : string;
  gender?        : Gender;
  birthday?      : Date;
  maritalStatus? : MaritalStatus;
  weddingDate?   : Date;
  language?      : string;
  panNo?         : string;
  passportNo?    : string;
  aadharNo?      : string;
}

const ProfileSubSchema = new Schema<IProfile>(
  {
    pictureUrl    : { type: String, trim: true },
    type          : { type: String, enum: Object.values(PersonType), default: PersonType.Person },
    title         : { type: String, enum: Object.values(Title) },
    roles         : [{ type: String, trim: true }],
    fullName      : { type: String, required: false, trim: true, maxlength: 200 },
    nationality   : { type: String, trim: true },
    gender        : { type: String, enum: Object.values(Gender) },
    birthday      : { type: Date },
    maritalStatus : { type: String, enum: Object.values(MaritalStatus) },
    weddingDate   : { type: Date },
    language      : { type: String, trim: true },
    panNo         : {
      type      : String,
      trim      : true,
      uppercase : true,
      match     : [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN number"],
    },
    passportNo : { type: String, trim: true, maxlength: 50 },
    aadharNo   : {
      type  : String,
      trim  : true,
      match : [/^\d{12}$/, "Aadhaar must be 12 digits"],
    },
  },
  { _id: false }
);

// ── 3b. Contact ──────────────────────────────────────────────
export interface IContact {
  contactNo?      : string;
  secondaryNo?    : string;
  email?          : string;
  secondaryEmail? : string;
  address1?       : IAddress;
  address2?       : IAddress;
}

const ContactSubSchema = new Schema<IContact>(
  {
    contactNo      : { type: String, trim: true },
    secondaryNo    : { type: String, trim: true },
    email          : { type: String, trim: true, lowercase: true },
    secondaryEmail : { type: String, trim: true, lowercase: true },
    address1       : { type: AddressSchema },
    address2       : { type: AddressSchema },
  },
  { _id: false }
);

// ── 3c. Family Member ────────────────────────────────────────
export interface IFamilyMember {
  relationType   : RelationType;
  name           : string;
  email?         : string;
  dateOfBirth?   : Date;
  phoneOrMobile? : string;
  language?      : string;
  occupation?    : Occupation;
}

const FamilyMemberSubSchema = new Schema<IFamilyMember>(
  {
    relationType  : { type: String, enum: Object.values(RelationType), required: false },
    name          : { type: String, required: false, trim: true, maxlength: 200 },
    email         : { type: String, trim: true, lowercase: true },
    dateOfBirth   : { type: Date },
    phoneOrMobile : { type: String, trim: true },
    language      : { type: String, trim: true },
    occupation    : { type: String, enum: Object.values(Occupation) },
  },
  { _id: true }
);

// ── 3d. Acknowledgement Preference ───────────────────────────
export interface IAcknowledgementPreference {
  generalCommunication  : IAcknowledgementChannel;
  receiptAcknowledgment : IAcknowledgementChannel;
  weddingWishes         : IAcknowledgementChannel;
  birthdayWishes        : IAcknowledgementChannel;
}

const AcknowledgementPreferenceSubSchema = new Schema<IAcknowledgementPreference>(
  {
    generalCommunication  : { type: AcknowledgementChannelSchema, default: () => ({}) },
    receiptAcknowledgment : { type: AcknowledgementChannelSchema, default: () => ({}) },
    weddingWishes         : { type: AcknowledgementChannelSchema, default: () => ({}) },
    birthdayWishes        : { type: AcknowledgementChannelSchema, default: () => ({}) },
  },
  { _id: false }
);

// ── 3e. Chalan Entry ─────────────────────────────────────────
export interface IChalanEntry {
  chalanDate           : Date;
  sourceOfDonation     : SourceOfDonation;
  currency             : Currency;
  amount               : number;
  modeOfPayment        : ModeOfPayment;
  amountDepositDate?   : Date;
  amountCreditBank?    : string;
  creditPerson         : CreditPersonType;
  creditPersonDetails? : ICreditPersonDetails;
  /**
   * One or more receipt allocations saved via the
   * "Receipt & Purpose Allocation" modal.
   * Each receipt has a date, a total, and multiple allocation lines.
   */
  receipts             : IReceipt[];
}

const ChalanEntrySubSchema = new Schema<IChalanEntry>(
  {
    chalanDate          : { type: Date, required: false },
    sourceOfDonation    : { type: String, enum: Object.values(SourceOfDonation), required: false },
    currency            : { type: String, enum: Object.values(Currency), default: Currency.INR },
    amount              : { type: Number, required: false, min: 0 },
    modeOfPayment       : { type: String, enum: Object.values(ModeOfPayment), required: false },
    amountDepositDate   : { type: Date },
    amountCreditBank    : { type: String, trim: true },
    creditPerson        : {
      type    : String,
      enum    : Object.values(CreditPersonType),
      default : CreditPersonType.Same,
    },
    creditPersonDetails : { type: CreditPersonDetailsSchema },
    receipts            : { type: [ReceiptSchema], default: [] },
  },
  { _id: true }
);

// ── 3f. Sponsorship Allocation ───────────────────────────────
export interface ISponsorshipAllocation {
  totalGiftAmount?      : number;
  sponsoredTo           : SponsoredTo;
  gender?               : Gender;
  quantity              : number;
  period?               : SponsorshipPeriod;
  childCode?            : string;
  childName?            : string;
  childrensHomeName?    : string;
  age?                  : number;
  sponsorshipStartDate? : Date;
  sponsorshipEndDate?   : Date;
  remarks?              : string;
}

const SponsorshipAllocationSubSchema = new Schema<ISponsorshipAllocation>(
  {
    totalGiftAmount      : { type: Number, min: 0 },
    sponsoredTo          : { type: String, enum: Object.values(SponsoredTo), default: SponsoredTo.Child },
    gender               : { type: String, enum: Object.values(Gender) },
    quantity             : { type: Number, required: false, min: 1, default: 1 },
    period               : { type: String, enum: Object.values(SponsorshipPeriod) },
    childCode            : { type: String, trim: true, maxlength: 50 },
    childName            : { type: String, trim: true, maxlength: 200 },
    childrensHomeName    : { type: String, trim: true, maxlength: 200 },
    age                  : { type: Number, min: 0 },
    sponsorshipStartDate : { type: Date },
    sponsorshipEndDate   : { type: Date },
    remarks              : { type: String, trim: true, maxlength: 1000 },
  },
  { _id: true }
);

// ── 3g. Subscription ─────────────────────────────────────────
export interface ISubscription {
  planName  : string;
  amount    : number;
  currency  : Currency;
  startDate : Date;
  endDate?  : Date;
  isActive  : boolean;
}

const SubscriptionSubSchema = new Schema<ISubscription>(
  {
    planName  : { type: String, required: false, trim: true },
    amount    : { type: Number, required: false, min: 0 },
    currency  : { type: String, enum: Object.values(Currency), default: Currency.INR },
    startDate : { type: Date, required: false },
    endDate   : { type: Date },
    isActive  : { type: Boolean, default: true },
  },
  { _id: true }
);

// ── 3h. Prayer Request ───────────────────────────────────────
export interface IPrayerRequest {
  requestDate   : Date;
  description   : string;
  isAnswered    : boolean;
  answeredDate? : Date;
}

const PrayerRequestSubSchema = new Schema<IPrayerRequest>(
  {
    requestDate  : { type: Date, required: false, default: Date.now },
    description  : { type: String, required: false, trim: true, maxlength: 2000 },
    isAnswered   : { type: Boolean, default: false },
    answeredDate : { type: Date },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────
// 4.  Root Donor Document
// ─────────────────────────────────────────────────────────────

export interface IDonor extends Document {
  // Personal
  profile                   : IProfile;
  contact?                  : IContact;
  familyMembers             : IFamilyMember[];
  acknowledgementPreference : IAcknowledgementPreference;

  // Payment
  chalanEntries          : IChalanEntry[];
  sponsorshipAllocations : ISponsorshipAllocation[];
  subscriptions          : ISubscription[];
  prayerRequests         : IPrayerRequest[];

  // Audit (auto via timestamps)
  createdAt : Date;
  updatedAt : Date;
}

const DonorSchema = new Schema<IDonor>(
  {
    profile : { type: ProfileSubSchema, required: false },
    contact : { type: ContactSubSchema },

    familyMembers : { type: [FamilyMemberSubSchema], default: [] },

    acknowledgementPreference : {
      type    : AcknowledgementPreferenceSubSchema,
      default : () => ({}),
    },

    chalanEntries          : { type: [ChalanEntrySubSchema],           default: [] },
    sponsorshipAllocations : { type: [SponsorshipAllocationSubSchema], default: [] },
    subscriptions          : { type: [SubscriptionSubSchema],          default: [] },
    prayerRequests         : { type: [PrayerRequestSubSchema],         default: [] },
  },
  { timestamps: true, versionKey: false }
);

// ─────────────────────────────────────────────────────────────
// 5.  Indexes
// ─────────────────────────────────────────────────────────────

DonorSchema.index({ "profile.fullName": "text" });
DonorSchema.index({ "profile.panNo": 1 },      { unique: true, sparse: true });
DonorSchema.index({ "profile.aadharNo": 1 },   { unique: true, sparse: true });
DonorSchema.index({ "contact.email": 1 },      { sparse: true });
DonorSchema.index({ "contact.contactNo": 1 },  { sparse: true });
DonorSchema.index({ "chalanEntries.chalanDate": -1 });
DonorSchema.index({ "chalanEntries.sourceOfDonation": 1 });
DonorSchema.index({ "chalanEntries.receipts.receiptDate": -1 });
DonorSchema.index({ "chalanEntries.receipts.lines.mainCategory": 1 });
DonorSchema.index({ "sponsorshipAllocations.sponsorshipStartDate": 1 });

// ─────────────────────────────────────────────────────────────
// 6.  Virtuals
// ─────────────────────────────────────────────────────────────

/** Computed age from birthday */
DonorSchema.virtual("profile.age").get(function (this: IDonor) {
  const dob = this.profile?.birthday;
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
});

/** Total donated — sum of all chalan amounts */
DonorSchema.virtual("totalDonated").get(function (this: IDonor) {
  return this.chalanEntries.reduce((sum, c) => sum + (c.amount ?? 0), 0);
});

/** Total allocated across all receipts and all their lines */
DonorSchema.virtual("totalAllocated").get(function (this: IDonor) {
  return this.chalanEntries.reduce((total, chalan) => {
    return total + chalan.receipts.reduce((rSum, receipt) => {
      return rSum + receipt.lines.reduce((lSum, line) => lSum + (line.amount ?? 0), 0);
    }, 0);
  }, 0);
});

// ─────────────────────────────────────────────────────────────
// 7.  Pre-save hooks
// ─────────────────────────────────────────────────────────────

DonorSchema.pre("save", function (next) {
  // Rule 1: Sponsorship end date must be >= start date
  for (const sp of this.sponsorshipAllocations) {
    if (sp.sponsorshipStartDate && sp.sponsorshipEndDate) {
      if (sp.sponsorshipEndDate < sp.sponsorshipStartDate) {
        return next(new Error("Sponsorship end date must be on or after start date"));
      }
    }
  }

  // Rule 2: creditPersonDetails required when creditPerson === 'Different'
  for (const ch of this.chalanEntries) {
    if (ch.creditPerson === CreditPersonType.Different && !ch.creditPersonDetails?.name) {
      return next(new Error("Credit person details required when Credit Person is 'Different'"));
    }

    // Rule 3: Sum of all allocation line amounts in a receipt must equal amountTotal
    for (const receipt of ch.receipts) {
      const lineSum = receipt.lines.reduce((s, l) => s + (l.amount ?? 0), 0);
      // Allow minor float rounding (±1 rupee tolerance)
      if (Math.abs(lineSum - receipt.amountTotal) > 1) {
        return next(
          new Error(
            `Receipt allocation lines (${lineSum}) do not match receipt total (${receipt.amountTotal})`
          )
        );
      }
    }
  }

});

// ─────────────────────────────────────────────────────────────
// 8.  Static helpers
// ─────────────────────────────────────────────────────────────

export interface IDonorModel extends Model<IDonor> {
  findByEmail(email: string): Promise<IDonor | null>;
  findByPAN(pan: string): Promise<IDonor | null>;
  findByAadhaar(aadhaar: string): Promise<IDonor | null>;
  findByCategory(category: string): Promise<IDonor[]>;
}

DonorSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ "contact.email": email.toLowerCase().trim() });
};

DonorSchema.statics.findByPAN = function (pan: string) {
  return this.findOne({ "profile.panNo": pan.toUpperCase().trim() });
};

DonorSchema.statics.findByAadhaar = function (aadhaar: string) {
  return this.findOne({ "profile.aadharNo": aadhaar.trim() });
};

/** Find all donors who have allocated to a given main category */
DonorSchema.statics.findByCategory = function (category: string) {
  return this.find({
    "chalanEntries.receipts.lines.mainCategory": {
      $regex: new RegExp(category, "i"),
    },
  });
};

// ─────────────────────────────────────────────────────────────
// 9.  Model export
// ─────────────────────────────────────────────────────────────

const Supporters: IDonorModel =
  (mongoose.models.Supporters as IDonorModel) ??
  model<IDonor, IDonorModel>("Supporters", DonorSchema);

export default Supporters;


/*
══════════════════════════════════════════════════════════════
  DATA SHAPE EXAMPLE  (matches the UI exactly)
══════════════════════════════════════════════════════════════

  chalanEntries: [
    {
      chalanDate      : new Date("2024-03-15"),
      sourceOfDonation: SourceOfDonation.Local,
      currency        : Currency.INR,
      amount          : 10000,
      modeOfPayment   : ModeOfPayment.UPI,
      creditPerson    : CreditPersonType.Same,
      receipts: [
        {
          receiptDate : new Date("2024-03-15"),
          amountTotal : 10000,            // ← shown read-only in modal header
          lines: [
            // ← rows in the table inside the modal
            { mainCategory: "child",     subcategory: "Support for Children's Home", amount: 111 },
            { mainCategory: "education", subcategory: "Leaders Training Program",    amount: 11  },
          ],
        },
      ],
    },
  ]

══════════════════════════════════════════════════════════════
  USAGE
══════════════════════════════════════════════════════════════

  // Create donor
  const donor = await Donor.create({
    profile : { type: PersonType.Person, fullName: "Laura Ellis", gender: Gender.Female },
    contact : { email: "laura@example.com" },
  });

  // Add chalan with receipt allocation
  donor.chalanEntries.push({
    chalanDate      : new Date(),
    sourceOfDonation: SourceOfDonation.Local,
    currency        : Currency.INR,
    amount          : 122,
    modeOfPayment   : ModeOfPayment.UPI,
    creditPerson    : CreditPersonType.Same,
    receipts: [{
      receiptDate : new Date(),
      amountTotal : 122,
      lines: [
        { mainCategory: "child",     subcategory: "Support for Children's Home", amount: 111 },
        { mainCategory: "education", subcategory: "Leaders Training Program",    amount: 11  },
      ],
    }],
  });
  await donor.save();

  // Query by category
  const childDonors = await Donor.findByCategory("child");

══════════════════════════════════════════════════════════════
*/