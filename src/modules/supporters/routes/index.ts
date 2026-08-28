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
supportersRouter.get('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const supporter = await Supporters.find();
     sendStandardResponse<any>(res, 'OK', {
      data: supporter,
      message: 'Successfully retrieved supporters',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});

supportersRouter.get("/search", async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim() || "";
    log(q, "search query");

    if (!q) {
      const users = await Supporters.find().limit(20);
      return res.json(users);
    }

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Split on commas, spaces, or semicolons — filter out empty strings
    const terms = q
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // Build one $or clause per term, then AND all term-clauses together
    const andConditions = terms.map((term) => {
      const safe = escapeRegex(term);
      const regex = new RegExp(safe, "i");
      const digitsOnly = term.replace(/\D/g, "");

      return {
        $or: [
          { name: regex },
          { "contacts.email": regex },
          { "contacts.secondaryEmail": regex },
          { "contacts.phoneNo": regex },
          { "contacts.secondaryNo": regex },
          ...(digitsOnly
            ? [
                { "contacts.phoneNo": new RegExp(digitsOnly, "i") },
                { "contacts.secondaryNo": new RegExp(digitsOnly, "i") },
              ]
            : []),
        ],
      };
    });
    console.log(andConditions, "andConditions");
    const users = await Supporters.find(
      andConditions.length > 0 ? { $and: andConditions } : {}
    ).limit(20);
    console.log(users, "search results");
    sendStandardResponse<any>(res, "OK", {
      data: users,
      message: "Successfully retrieved supporters",
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
supportersRouter.get('/:id', async (req, res) => {
   log(req.body, 'req.body');
    try {
    const supporter = await Supporters.findById(req.params.id);
     sendStandardResponse<any>(res, 'OK', {
      data: supporter,
      message: 'Successfully retrieved supporters',
    });
  } catch (err) {
    log(err);
  }
    // const result = await Supporters.create(req.body);
   
 

});



export default supportersRouter;