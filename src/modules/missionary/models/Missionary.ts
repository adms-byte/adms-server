import { Schema, model, models, Document, Types } from "mongoose";

/**
 * Missionary model
 * -----------------------------------------------------------------------
 * Mirrors the MissionaryFormData fields from MissionaryDetailsForm.tsx.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Enums (kept in sync with the option lists used in the form)
// ---------------------------------------------------------------------------

export const MINISTRY_OPTIONS = [
  "Evangelism",
  "Discipleship",
  "Community Development",
  "Youth Ministry",
  "Women's Ministry",
  "Church Planting",
  "Children Ministry",
] as const;

export const METHOD_OPTIONS = [
  "Door-to-door evangelism",
  "Group Bible studies",
  "Community service projects",
  "Church services",
] as const;

export const FREQUENCY_OPTIONS = [
  "Daily",
  "Several times a week",
  "Weekly",
  "Monthly",
] as const;

export type MinistryOption = (typeof MINISTRY_OPTIONS)[number];
export type MethodOption = (typeof METHOD_OPTIONS)[number];
export type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];

// ---------------------------------------------------------------------------
// TypeScript interface
// ---------------------------------------------------------------------------

export interface IMissionary extends Document {
  // Missionary Details
  name: string;
  sponsoreeCode: string;
  spouseName?: string;
  division: string;
  subDivision?: string;
  basedAtDist: string;
  basedAtState: string;
  profilePhotoUrl?: string;

  // Ministry Work
  ministriesInvolved: MinistryOption[];
  ministriesOther?: string;
  outreachFrequency?: FrequencyOption;
  outreachFrequencyOther?: string;
  primaryMethods: MethodOption[];
  primaryMethodsOther?: string;
  successfulOutreach?: string;
  challenges?: string;
  establishedNewChurch?: "yes" | "no";
  establishedNewChurchDetails?: string;

  // Community Impact and Relationships
  buildRelationships?: string;
  spiritualNeeds?: string;
  lifeTransformations?: string;
  communityResponse?: string;

  // Personal Reflections
  rewardingAspect?: string;
  personalChallenges?: string;
  familyParticipation?: string;

  // Feedback and Recommendations
  additionalInfo?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const MissionarySchema = new Schema<IMissionary>(
  {
    // ---------- Missionary Details ----------
    name: { type: String, required: true, trim: true },
    sponsoreeCode: { type: String, required: true, trim: true, unique: true },
    spouseName: { type: String, trim: true },
    division: { type: String, required: true, trim: true },
    subDivision: { type: String, trim: true },
    basedAtDist: { type: String, required: true, trim: true },
    basedAtState: { type: String, required: true, trim: true },
    profilePhotoUrl: { type: String, trim: true },

    // ---------- Ministry Work ----------
    ministriesInvolved: {
      type: [String],
      enum: MINISTRY_OPTIONS,
      default: [],
    },
    ministriesOther: { type: String, trim: true },

    outreachFrequency: {
      type: String,
      enum: FREQUENCY_OPTIONS,
    },
    outreachFrequencyOther: { type: String, trim: true },

    primaryMethods: {
      type: [String],
      enum: METHOD_OPTIONS,
      default: [],
    },
    primaryMethodsOther: { type: String, trim: true },

    successfulOutreach: { type: String, trim: true },
    challenges: { type: String, trim: true },

    establishedNewChurch: {
      type: String,
      enum: ["yes", "no"],
    },
    establishedNewChurchDetails: { type: String, trim: true },

    // ---------- Community Impact and Relationships ----------
    buildRelationships: { type: String, trim: true },
    spiritualNeeds: { type: String, trim: true },
    lifeTransformations: { type: String, trim: true },
    communityResponse: { type: String, trim: true },

    // ---------- Personal Reflections ----------
    rewardingAspect: { type: String, trim: true },
    personalChallenges: { type: String, trim: true },
    familyParticipation: { type: String, trim: true },

    // ---------- Feedback and Recommendations ----------
    additionalInfo: { type: String, trim: true },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

// Helpful indexes for common lookups
MissionarySchema.index({ division: 1, subDivision: 1 });
MissionarySchema.index({ basedAtState: 1, basedAtDist: 1 });

// Avoid recompiling the model on hot-reload (Next.js / ts-node-dev, etc.)
export const Missionary =
  models.Missionary || model<IMissionary>("Missionary", MissionarySchema);

export default Missionary;