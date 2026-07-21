import { Router } from "express";
import { log } from "console";
import { sendStandardResponse } from "../../../extras/helpers";
import Childrens from "../models/Childrens";
import { extrasConnection } from "../../..";

const childrensRouter = Router();

childrensRouter.post('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const childrens = await Childrens.create(req.body);
     sendStandardResponse<any>(res, 'OK', {
      data: childrens,
      message: 'Successfully created childrens',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});
childrensRouter.get('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const supporter = await Childrens.find();
     sendStandardResponse<any>(res, 'OK', {
      data: supporter,
      message: 'Successfully retrieved Childrens',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});
childrensRouter.get('/others', async (req, res) => {
   log(req.body, 'req.body');
    try {
      const children = await extrasConnection.collection("childrens").find().limit(50).toArray();
      console.log(children, 'children');
      
     sendStandardResponse<any>(res, 'OK', {
      data: children,
      message: 'Successfully retrieved Childrens',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});
// // childrensRouter.get('/:id', async (req, res) => {
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



export default childrensRouter;