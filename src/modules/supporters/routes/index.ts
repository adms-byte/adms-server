import { Router } from "express";
import Supporters from "../models/Supporters";
import { log } from "console";

const supportersRouter = Router();

supportersRouter.get('/', async (req, res) => {
   
  await Supporters.find().then((supporters) => {
    console.log(supporters, 'supporters');
  })
  .catch((err) => {
    res.status(500).json({ error: 'Failed to fetch supporters' });
  });
  res.send('Supporters route is working!');
  

});



export default supportersRouter;