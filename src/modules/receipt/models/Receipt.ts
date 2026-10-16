import mongoose, { Schema, Document, Model, Types, HydratedDocument } from "mongoose";
import ChalanLifeCycleStates from "../extras/chalanLifeCycleStates";

/* ---------- DB connection (database name: chalan) ---------- */
// mongoose.connect(process.env.MONGO_URI as string, { dbName: "chalan" });

/* ---------- Types ---------- */
export type ChalanStatus = ChalanLifeCycleStates;
export type ReceiptStatus = "pending" | "generated" | "cancelled";
export type PaymentMode = "cash" | "online" | "cheque" | "dd";
export type OnlinePaymentType = "upi" | "neft" | "rtgs" | "imps" | "card";
export type SourceOfDonation = "local" | "foreign" | "online";

export interface ISponsoredChild {
  childId?: Types.ObjectId;
  childCode?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
}

export interface IRowSponsorship {
  sponsoredTo?: "child" | "other";
  period?: number; // months
  startDate?: Date;
  endDate?: Date;
  children?: ISponsoredChild[];
}

export interface IAllocationRow {
  mainPurposeCategory: string;
  subcategory: string;
  amount: number;
  sponsorshipAllocationInput?: IRowSponsorship;
}

export interface IReceipt {
  receiptNo: number;
  receiptCode?: string;
  receiptStatus: ReceiptStatus;
  donorId?: Types.ObjectId;
  donorName: string;
  receiptAmount: number;
  balanceAmount: number;
  sponsorshipAllocationInput?: {
    gender?: "Male" | "Female" | "Any";
    quantity?: number;
  };
  rows: IAllocationRow[];
}

export interface IChalan {
  chalanCode?: string;
  chalanStatus: ChalanLifeCycleStates;

  donorCode?: string;
  donorName: string;
  donorPhone?: string;
  donorAddress?: string;

  amount: number;
  balanceAmount: number;
  balanceAmountReceipt: number;
  paymentMode: PaymentMode;
  onlinePaymentType?: OnlinePaymentType;
  transactionId?: string;
  amountCreditBank?: string;
  amountDepositDate?: Date;
  chalanDate: Date;
  creditPerson: string;

  sourceOfDonation?: SourceOfDonation;
  promotionalOfficerName?: string;
  remark?: string;

  receipts: IReceipt[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChalanDocument extends IChalan, Document {}
export type ChalanDoc = HydratedDocument<IChalan>;

/* ---------- Auto-increment counter (for chalanCode / receiptCode) ---------- */
interface ICounter {
  _id: string;
  seq: number;
}

const Counter: Model<ICounter> =
  (mongoose.models.Counter as Model<ICounter>) ||
  mongoose.model<ICounter>(
    "Counter",
    new Schema<ICounter>({ _id: String, seq: { type: Number, default: 0 } })
  );

const nextSeq = async (key: string): Promise<number> => {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc!.seq;
};

// "" from the form -> undefined, so ObjectId casting doesn't fail
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

/* ---------- Sub-schemas ---------- */
const sponsoredChildSchema = new Schema<ISponsoredChild>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child" },
    childCode: String,
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
  },
  { _id: false }
);

const rowSponsorshipSchema = new Schema<IRowSponsorship>(
  {
    sponsoredTo: { type: String, enum: ["child", "other"] },
    period: Number,
    startDate: Date,
    endDate: Date,
    children: [sponsoredChildSchema],
  },
  { _id: false }
);

const allocationRowSchema = new Schema<IAllocationRow>(
  {
    mainPurposeCategory: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    sponsorshipAllocationInput: rowSponsorshipSchema,
  },
  { _id: false }
);

const receiptSchema = new Schema<IReceipt>({
  receiptNo: { type: Number, required: true },
  receiptCode: { type: String, unique: true, sparse: true },
  receiptStatus: {
    type: String,
    enum: ["pending", "generated", "cancelled"],
    default: "pending",
  },
  donorId: { type: Schema.Types.ObjectId, ref: "Donor", set: emptyToUndefined },
  donorName: { type: String, required: true, trim: true },
  receiptAmount: { type: Number, required: true, min: 0 },
  balanceAmount: { type: Number, default: 0 },
  sponsorshipAllocationInput: {
    gender: { type: String, enum: ["Male", "Female", "Any"] },
    quantity: Number,
  },
  rows: [allocationRowSchema],
});

/* ---------- Main chalan schema ---------- */
const chalanSchema = new Schema<IChalan>(
  {
    chalanCode: { type: String, unique: true, index: true },
    chalanStatus: {
      type: Number,
      // enum: ChalanLifeCycleStates,
      // default: ChalanLifeCycleStates.Pending,
    },

    donorCode: String,
    donorName: { type: String, required: true, trim: true },
    donorPhone: String,
    donorAddress: String,

    amount: { type: Number, required: true, min: 0 },
    balanceAmount: { type: Number, default: 0 },
    balanceAmountReceipt: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ["cash", "online", "cheque", "dd"], required: false },
    onlinePaymentType: { type: String, enum: ["upi", "neft", "rtgs", "imps", "card"] },
    transactionId: String,
    amountCreditBank: String,
    amountDepositDate: Date,
    chalanDate: { type: Date, default: Date.now },
    creditPerson: { type: String, default: "same" },

    sourceOfDonation: { type: String, enum: ["local", "foreign", "online"] },
    promotionalOfficerName: String,
    remark: String,

    receipts: [receiptSchema],
  },
  { timestamps: true, collection: "chalans" }
);

/* ---------- Auto-generate codes on first save ---------- */
chalanSchema.pre("validate", async function (next) {
  try {
    const year = new Date().getFullYear();

    if (!this.chalanCode) {
      const n = await nextSeq(`chalan-${year}`);
      this.chalanCode = `CH-${year}-${String(n).padStart(5, "0")}`;
    }

    for (const r of this.receipts) {
      if (!r.receiptCode) {
        const n = await nextSeq(`receipt-${year}`);
        r.receiptCode = `RC-${year}-${String(n).padStart(5, "0")}`;
      }
    }
    // next();
  } catch (err) {
    // next(err as Error);
  }
});

const Chalan: Model<IChalan> =
  (mongoose.models.Chalan as Model<IChalan>) || mongoose.model<IChalan>("Chalan", chalanSchema);

export default Chalan;