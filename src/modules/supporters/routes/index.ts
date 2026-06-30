import { Router } from "express";
import Supporters from "../models/Supporters";
import { log } from "console";
import { sendStandardResponse } from "../../../extras/helpers";

const supportersRouter = Router();

supportersRouter.post('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const supporter = await Supporters.create(req.body);
     sendStandardResponse<any>(res, 'OK', {
      data: supporter,
      message: 'Successfully created supporter',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});



export default supportersRouter;