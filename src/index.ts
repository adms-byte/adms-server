
import express, {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import 'colors';
import mongoose, {Types} from 'mongoose';
import morgan, {token} from 'morgan';
import fs from 'fs';
import cors from 'cors';
import router from './router';
import commonEvents from './events/common_events';
import { sendStandardResponse } from './extras/helpers';
// import Division from './modules/divisions/models/Division';
// import Worker from './modules/workers/models/Worker';
// import {ObjectId} from 'mongodb';
// import UserPermissions from './modules/users/models/UserPermissions';
// import IROLifeCycleStates from './modules/IRO/extras/IROLifeCycleStates';
// import IRO from './modules/IRO/models/IRO';

// console.log(process.env, 'uuu'.bgBlue);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not found in environment variables');
}
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('PORT not found in environment variables!');
}


// a();
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json({limit: '20mb'}));
app.use(morgan('dev'));
app.use(cors());
app.use(router);
// const u=async ()=>{
//   const data= await Child.updateMany({supportEnabled: true});
//   console.log(data, 'data');
// };
// u();
// const upload = multer({
//   // limits: { fileSize: 10 }, // limit file size to 10 bytes
//   storage: multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, './uploads'); // specify the destination folder here
//     },
//     filename: function(req, file, cb) {
//       cb(null, file.originalname); // use the original filename
//     },
//   }),
//   // TODO: ensure that the files are actually getting deleted from the Temp folder after response is sent
// });
// app.post('/', upload.single('file'), (req, res) => {
//   res.status(200).json({
//     data: {
//       _id: (new Date()).getTime().toString(),
//       name: req.file?.filename,
//       type: req.file?.mimetype,
//       size: req.file?.size,
//       storage: 'Drive',
//       fileId: '03v9runt3',
//       downloadURL: 'fwe0nvifjr',
//       private: false,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//     message: 'Succesfully uploaded file!',
//     result: 'success',
//     timeout: 1100,
//   });
// });
// eslint-disable-next-line @typescript-eslint/no-empty-function
// eslint-disable-next-line @typescript-eslint/no-unused-vars


// test();
if (!process.env.S3_ACCESS_KEY|| !process.env.S3_SECRET_KEY) {
  throw new Error('S3_ACCESS_KEY or S3_SECRET_KEY is not defined in environment variables');
}

// const s3: any = new S3Client({
//   region: 'ap-south-1', // Change to your AWS region
//   credentials: {
//     accessKeyId: process.env.S3_ACCESS_KEY, // Use environment variables
//     secretAccessKey: process.env.S3_SECRET_KEY,
//   },
// });

// Example usage
// backupDatabase();




// http://localhost:8002/run-cron cron test url
app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
  console.info('Caught error by the error handler!!!');
  // log the error
  commonEvents.emit('error', {data: error});
  sendStandardResponse(res, 'INTERNAL SERVER ERROR', {
    error: error.message, message: 'Oops! Something went wrong! We\'re working on it!',
  });
});

app.use((req: Request, res: Response) => {
  commonEvents.emit('error', {data: new Error(`404 Found for ${req.url}`)});
  sendStandardResponse(res, 'NOT FOUND', {
    error: '404 Not Found (REST API Endpoint not implemented)',
    message: 'Oops! Something went wrong! We\'re working on it!',
  });
});
// incompleteIRONotification();
// startResetChildSupport();
// startPmaDeduction(); // Start the PMA deduction cron job
// pmaDeduction();
// resetChildSupport();
// Enable Mongoose debugging
// mongoose.set('debug', true);
// console.log(mongoose.version);

// const x=async ()=>{
//   const divisions = await Division.find({});
//   const coordinatorNames = divisions.map((d) => d.details.coordinator?.name);

//   // console.log(coordinatorNames, 'coordinatorNames');

//   const workers = await Worker.find({'_id': {$in: coordinatorNames}});

//   // console.log(workers.map((id)=>id._id), 'workers');
// };
// x();
console.log('Trying to connect to mongodb'.yellow);

// Primary connection (default) — this is what mongoose.model() uses everywhere
mongoose.connect(process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017')
  .then(() => console.log('Connected to primary mongodb'.bgGreen))
  .catch((error) => commonEvents.emit('error', error));

// Secondary connection — separate DB, needs its own connection object
export const extrasConnection = mongoose.createConnection(
  process.env.MONGO_DB_EXTRAS ?? 'mongodb://127.0.0.1:27017/adms'
);

extrasConnection.on('connected', () => console.log('Connected to extras mongodb'.bgGreen));
extrasConnection.on('error', (error) => commonEvents.emit('error', error));

app
  .listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`.bgGreen))
  .on('error', (error) => commonEvents.emit('error', { data: error }));

// Google.Gmail.initialize(Google.Auth.getAuth()); // GoogleMail
// Google.Drive.initialize(Google.Auth.getAuth()); // GoogleMail

// const useMockMailService = process.env.MOCK_EMAIL_SERVER !== 'false' || false;
// console.log(
//   (
//     useMockMailService ?
//       'Using mock email service for sending any emails!' :
//       'Using actual email service for sending any emails!'
//   ).bgGreen,
// );

// // const useMockSMSService = process.env.MOCK_SMS_SERVICE !== 'false' || false;

// // // console.log((useMockSMSService ? 'Using mock SMS service for sending any SMSs!' : 'Using actual SMS service for sending any SMSs!').bgGreen);

// // // SMSSender.set('mockSending', useMockSMSService); //sms disabled


// Mailer.use('Gmail');
