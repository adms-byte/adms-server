import { Router } from "express";
import { log } from "console";
import { sendStandardResponse } from "../../../extras/helpers";
import { Missionary } from "../models/Missionary";
import { extrasConnection } from "../../..";
import Childrens from "../../childrens/models/Childrens";
import Supporters from "../../supporters/models/Supporters-copy";

const missionaryRouter = Router();

missionaryRouter.post('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const missionary = await Missionary.create(req.body);
     sendStandardResponse<any>(res, 'OK', {
      data: missionary,
      message: 'Successfully created Missionary',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});
missionaryRouter.get('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const missionary = await Missionary.find();
     sendStandardResponse<any>(res, 'OK', {
      data: missionary,
      message: 'Successfully retrieved Missionary',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});
missionaryRouter.post('/search', async (req, res) => {
  try {
    const {
      gender,        // 'male' | 'female' | '' (empty = any)
      period,        // e.g. an age-range or sponsorship-period field — adjust field name as needed
      startDate,
      endDate,
      quantity
    } = req.body;

    const qty = Math.max(parseInt(quantity, 10) || 1, 1);
console.log(qty, 'qty');

    // Build a shared match filter
    const filter: any = {};


    if (gender) {
      filter.gender = gender;
    }

    if (period) {
      filter.period = period; // adjust to your real schema field
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
console.log(filter, 'filter');

    // Random sample from the raw "extras" collection
    const extrasChildren = await extrasConnection
      .collection('users')
      .aggregate([
        { $match: filter },
        { $sample: { size: qty } }
      ])
      .toArray();

    // Random sample from the Mongoose model's collection
    const modelChildren = await Supporters.aggregate([
      { $match: filter },
      { $sample: { size: qty } }
    ]);
console.log(modelChildren, 'modelChildren');
    // Mix both sources together
    let combined = [...extrasChildren, ...modelChildren];

    // Shuffle (Fisher-Yates) so the mix isn't source-ordered
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    // Trim down to exactly the requested quantity
    combined = combined.slice(0, qty);

    sendStandardResponse<any>(res, 'OK', {
      data: combined,
      message: 'Successfully retrieved Missionary',
    });
  } catch (err) {
    log(err);
    sendStandardResponse<any>(res, "BAD REQUEST", {
      data: null,
      message: 'Failed to retrieve Missionary',
    });
  }
});
// // missionaryRouter.get('/:id', async (req, res) => {
// //    log(req.body, 'req.body');
// //     try {
// //     const supporter = await Supporters.findById(req.params.id);
// //      sendStandardResponse<any>(res, 'OK', {
// //       data: supporter,
// //       message: 'Successfully retrieved supporters',
// //     });
// //   } catch (err) {
// //     log(err);
// //   }
// //     // const result = await Supporters.create(req.body);
   
 

// });



export default missionaryRouter;