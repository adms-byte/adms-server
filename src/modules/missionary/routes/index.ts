import { Router } from "express";
import { log } from "console";
import { sendStandardResponse } from "../../../extras/helpers";
import { Missionary } from "../models/Missionary";

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