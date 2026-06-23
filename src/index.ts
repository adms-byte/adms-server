import colors from 'colors';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
console.info('Starting project...'.green);
colors.enable();
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);



app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(extendResponse);
// app.use(router);

console.log(process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/adms');

mongoose
  .connect(process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/adms')
  .then(async () => {
    console.log('Connected to mongodb');
    // if (!(await FormattedCode.findOne({}))) {
    //   FormattedCode.create({
    //     auctionCode: 0,
    //     lotCode: 0,
    //   })
    //     .then(() => console.log('Created FormattedCode document'.bgBlue))
    //     .catch((error) => console.log(error));
    // }
    // if (!(await Settings.findOne({}))) {
    //   Settings.create({
    //     commissionPerCent: 1.5,
    //     gstPerCent: 5,
    //     sampleCharge: 1,
    //   })
    //     .then(() => console.log('Created Settings document'.bgBlue))
    //     .catch((error) => console.log(error));
    // }


// await Auction.findByIdAndUpdate('66cc7e73404b7157774d2f77',{status:201})    // seeder();
// await Lot.updateMany({auction:'66cc7e73404b7157774d2f77'},{status:201})    // seeder();
    // await User.updateMany({}, {
    //   profilePic: new mongoose.Types.ObjectId('6500021f7623dd1f9ce55177')
    // });
    // console.log('Done');
  })
  .catch((error) => {
    console.log(error);
  });

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`.bgGreen);
});
