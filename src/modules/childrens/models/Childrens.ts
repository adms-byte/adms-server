const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for: IET WD-SRD Format Renewal Application / Annual Report - Missionary Child
 * Rev: 01-05-2014
 */
const ChildSchema = new Schema(
  {
    divisionName: { type: String, trim: true }, // "Name of Division"

    // ---------------- Details of the Child ----------------
    childDetails: {
      name: { type: String, required: true, trim: true },
      childCode: { type: String, trim: true },
      age: { type: Number, min: 0 },
      gender: { type: String, enum: ['Male', 'Female'] },
      motherTongue: { type: String, trim: true },
      otherLanguagesKnown: { type: String, trim: true },
      fatherName: { type: String, trim: true },
      fatherCode: { type: String, trim: true },
      motherName: { type: String, trim: true },
      placeOfWork: { type: String, trim: true },
      address: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
    },

    // ---------------- Details of the Previous Academic Year ----------------
    previousAcademicYear: {
      className: { type: String, trim: true }, // "Class"
      classTeacherName: { type: String, trim: true },
      mediumOfInstruction: { type: String, trim: true },
      schoolName: { type: String, trim: true },
      place: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
    },

    // ---------------- Details of the New Academic Year ----------------
    newAcademicYear: {
      passedFinalExam: { type: Boolean }, // Yes/No
      percentageOrGrade: { type: String, trim: true },
      promotedToClass: { type: String, trim: true },
      studyingInSameSchool: { type: Boolean }, // Yes/No
      reasonIfNotSameSchool: { type: String, trim: true },
      newSchoolName: { type: String, trim: true },
      place: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      studyingInBoardingSchool: { type: Boolean }, // Yes/No
      boardingSchoolDetails: { type: String, trim: true },
    },

    // ---------------- Details of Studies and Other Activities ----------------
    studiesAndActivities: {
      schoolPerformance: {
        type: String,
        enum: [
          'Excellent - Above average in most subjects',
          'Good - Performing well in most subjects',
          'Average - Needs improvement in some areas',
          'Below Average - Struggling with several subjects',
        ],
      },
      favouriteSubjects: {
        type: [
          {
            type: String,
            enum: [
              'Mathematics',
              'Science',
              'English',
              'Social Studies',
              'Computer Studies',
              'Arts & Crafts',
              'Physical Education',
              'Bible/Religious Studies',
              'Other',
            ],
          },
        ],
        default: [],
      },
      favouriteSubjectOther: { type: String, trim: true }, // free text for "Other"
      receivedAcademicAward: { type: Boolean },
      academicAwardDetails: { type: String, trim: true },
      extracurricularActivities: {
        type: [
          {
            type: String,
            enum: [
              'Sports (e.g., football, cricket, athletics)',
              'Music (e.g., singing, instruments)',
              'Art & Drawing',
              'Dance or Drama',
              'Church or Youth Fellowship Activities',
              'Volunteering or Helping at Church/Home',
            ],
          },
        ],
        default: [],
      },
      futureAmbition: { type: String, trim: true }, // "What does the child want to become"
      hobbies: { type: String, trim: true },
      favouriteGamesAndSports: { type: String, trim: true },
    },

    // ---------------- Details of Spiritual Activities ----------------
    spiritualActivities: {
      churchName: { type: String, trim: true },
      churchPlace: { type: String, trim: true },
      attendsSundaySchool: { type: Boolean },
      sundaySchoolClass: { type: String, trim: true },
      isChoirMember: { type: Boolean },
      playsMusicInstrument: { type: Boolean },
      instrumentNames: { type: String, trim: true },
    },

    // ---------------- Details of Child's Health ----------------
    health: {
      hadHealthProblemLastYear: { type: Boolean },
      healthProblemDetails: { type: String, trim: true },
      hasDisability: { type: Boolean }, // physical/mental disability
      disabilityDetails: { type: String, trim: true },
    },

    // ---------------- Details of Activities During Summer Vacation ----------------
    summerVacation: {
      activities: {
        type: [
          {
            type: String,
            enum: [
              'Bible Camp',
              'Family Ministry Trip',
              'Helping at Home',
              'Learning Program',
              'Sports/Outdoor Play',
              'CNP/PCM/VBS',
              'Other',
            ],
          },
        ],
        default: [],
      },
      activityOther: { type: String, trim: true },
      specialExperience: { type: String, trim: true },
    },

    // ---------------- Details of the Fees ----------------
    fees: {
      schoolAnnualFees: { type: Number, min: 0 },
      monthlyTuitionFees: { type: Number, min: 0 },
      otherFees: { type: Number, min: 0 },
      totalFees: { type: Number, min: 0 },
    },

    // ---------------- Signatures ----------------
    signatures: {
      child: { type: String, trim: true }, // could store signature image URL/base64 or name typed
      father: { type: String, trim: true },
      mother: { type: String, trim: true },
      date: { type: Date },
    },

    // ---------------- Divisional Leader's Recommendation ----------------
    divisionalLeaderRecommendation: {
      leaderName: { type: String, trim: true },
      date: { type: Date },
      comments: { type: String, trim: true },
      signature: { type: String, trim: true },
    },

    // ---------------- For IET HQ Office Use Only ----------------
    hqOfficeUse: {
      photographReceived: { type: Boolean },
      reportCardOrMarkSheetReceived: { type: Boolean },
      dealingStaffName: { type: String, trim: true },
      dealingStaffSignature: { type: String, trim: true },
      receivedDate: { type: Date },
      presidentSignature: { type: String, trim: true },
      presidentSignDate: { type: Date },
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

module.exports = mongoose.model('Child', ChildSchema);