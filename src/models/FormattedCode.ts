import {Schema, Types, model} from 'mongoose';

export interface IFormattedCode{
    _id: Types.ObjectId;
    supporterCode: number; // WK00001
    chellanCode: number; // IETWK00001
    TransactionCode: number; // MC00001

}

const FormattedCodeSchema = new Schema<IFormattedCode>({
  _id: Schema.Types.ObjectId,
  supporterCode: {type: Number, required: true}, // Store the year for reset tracking
  chellanCode: {type: Number, required: true},
  TransactionCode: {type: Number, required: true},
});

export const FormattedCode = model<IFormattedCode>('formatted_codes', FormattedCodeSchema);
