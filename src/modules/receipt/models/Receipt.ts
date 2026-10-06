import mongoose, { Schema, Document } from "mongoose";


export interface IReceipt {
  receipts: [];
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}


const ReceiptSchema = new Schema<IReceipt>(
  {
    receipts: {type: [Object], default: []},
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);