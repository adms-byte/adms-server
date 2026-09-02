import { Router } from "express";
import Supporters from "../models/Supporters";
import { log } from "console";
import { sendStandardResponse } from "../../../extras/helpers";
import { FormattedCode } from "../../../models/FormattedCode";
import CommonLifeCycleStates from "../../../extras/CommonLifeCycleStates";

const supportersRouter = Router();

supportersRouter.post('/', async (req, res) => {
   log(req.body, 'req.body');
    try {
   const counterDoc = await FormattedCode.findOneAndUpdate(
    {},
    { $inc: { supporterCode: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const SupportCode =
    'DN' + counterDoc.supporterCode.toString().padStart(5, '0');

  const supporter = await Supporters.create({
    ...req.body,
    supporterCode: SupportCode,
    status:CommonLifeCycleStates.ACTIVE
  });
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
  log(req.query, 'req.query');
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const skip = (page - 1) * limit;

    // build filter conditionally — only add roles filter if role param was sent
    const filter: Record<string, any> = {};
    const roleParam = req.query.roles as string | undefined;

    if (roleParam) {
      const roleValues = roleParam
        .split(',')
        .map((r) => parseInt(r, 10))
        .filter((n) => !isNaN(n));

      if (roleValues.length) {
        filter.roles = { $in: roleValues }; // matches if roles array contains ANY of these
      }
    }
     filter.status = CommonLifeCycleStates.ACTIVE; // Only fetch supporters with ACTIVE status
    const [supporters, totalCount] = await Promise.all([
      Supporters.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supporters.countDocuments(filter), // ← same filter, so count matches the filtered set
    ]);

    sendStandardResponse<any>(res, 'OK', {
      data: supporters,
      message: 'Successfully retrieved supporters',
      // pagination: {
      //   page,
      //   limit,
      //   totalCount,
      //   hasMore: skip + supporters.length < totalCount,
      // },
    });
  } catch (error) {
    console.error('Error fetching supporters:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch supporters', error });
  }
});
supportersRouter.get('/getDonorCounters', async (req, res) => {
  try {
    log(req.query, 'req.query');

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of the 60-day window (60 days ago from today, at midnight)
    const startOf60Days = new Date();
    startOf60Days.setDate(startOf60Days.getDate() - 59); // -59 so it includes today = 60 days total
    startOf60Days.setHours(0, 0, 0, 0);

    const stats = await Supporters.aggregate([
      { $match: { roles: 200 } }, // Filter for supporters with role 200 (donors)
      {
        $facet: {
          totalCount: [{ $count: 'count' }],

          activeCount: [
            { $match: { status: 100 } }, // ← change to your actual active flag
            { $count: 'count' },
          ],

          currentMonthCount: [
            { $match: { createdAt: { $gte: startOfCurrentMonth } } },
            { $count: 'count' },
          ],

          last60DaysCount: [
            { $match: { createdAt: { $gte: startOf60Days } } },
            { $count: 'count' },
          ],

          last60DaysTrend: [
            { $match: { createdAt: { $gte: startOf60Days } } },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
          ],
        },
      },
    ]);

    const result = stats[0];

    // Fill in days with 0 count so the trend has no gaps (60 continuous days)
    const dailyMap = new Map(
      result.last60DaysTrend.map((d: any) => [`${d._id.year}-${d._id.month}-${d._id.day}`, d.count]),
    );

    const last60DaysTrend = Array.from({ length: 60 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (59 - i));
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      return {
        date: d.toISOString().split('T')[0], // "2026-08-15"
        label: d.toLocaleString('default', { month: 'short', day: 'numeric' }), // "Aug 15"
        count: dailyMap.get(key) || 0,
      };
    });

    sendStandardResponse<any>(res, 'OK', {
      data: {
        totalCount: result.totalCount[0]?.count || 0,
        activeCount: result.activeCount[0]?.count || 0,
        currentMonthCount: result.currentMonthCount[0]?.count || 0,
        last60DaysCount: result.last60DaysCount[0]?.count || 0,
        last60DaysTrend,
      },
      message: 'Successfully retrieved supporters',
    });
  } catch (error) {
    console.error('Error fetching supporter stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supporter stats',
      error,
    });
  }
});
supportersRouter.get('/getSponsorCounters', async (req, res) => {
  try {
    log(req.query, 'req.query');

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of the 60-day window (60 days ago from today, at midnight)
    const startOf60Days = new Date();
    startOf60Days.setDate(startOf60Days.getDate() - 59); // -59 so it includes today = 60 days total
    startOf60Days.setHours(0, 0, 0, 0);

    const stats = await Supporters.aggregate([
      { $match: { roles: 201 } }, // Filter for supporters with role 201 (sponsors)
      {
        $facet: {
          totalCount: [{ $count: 'count' }],

          activeCount: [
            { $match: { status: 100 } }, // ← change to your actual active flag
            { $count: 'count' },
          ],

          currentMonthCount: [
            { $match: { createdAt: { $gte: startOfCurrentMonth } } },
            { $count: 'count' },
          ],

          last60DaysCount: [
            { $match: { createdAt: { $gte: startOf60Days } } },
            { $count: 'count' },
          ],

          last60DaysTrend: [
            { $match: { createdAt: { $gte: startOf60Days } } },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
          ],
        },
      },
    ]);

    const result = stats[0];

    // Fill in days with 0 count so the trend has no gaps (60 continuous days)
    const dailyMap = new Map(
      result.last60DaysTrend.map((d: any) => [`${d._id.year}-${d._id.month}-${d._id.day}`, d.count]),
    );

    const last60DaysTrend = Array.from({ length: 60 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (59 - i));
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      return {
        date: d.toISOString().split('T')[0], // "2026-08-15"
        label: d.toLocaleString('default', { month: 'short', day: 'numeric' }), // "Aug 15"
        count: dailyMap.get(key) || 0,
      };
    });

    sendStandardResponse<any>(res, 'OK', {
      data: {
        totalCount: result.totalCount[0]?.count || 0,
        activeCount: result.activeCount[0]?.count || 0,
        currentMonthCount: result.currentMonthCount[0]?.count || 0,
        last60DaysCount: result.last60DaysCount[0]?.count || 0,
        last60DaysTrend,
      },
      message: 'Successfully retrieved supporters',
    });
  } catch (error) {
    console.error('Error fetching supporter stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supporter stats',
      error,
    });
  }
});

supportersRouter.get('/getCounters', async (req, res) => {
  try {
    log(req.query.data, 'req.query');

    const roleFilter = req.query.data ? parseInt(req.query.data as string, 10) : undefined;
    const hasValidRole = roleFilter !== undefined && !isNaN(roleFilter);

    const stats = await Supporters.aggregate([
      {
        $facet: {
          totalCount: [
            { $count: 'count' },
          ],

          activeCount: [
            { $match: { status: 100 } }, // ← change to your actual active flag
            { $count: 'count' },
          ],

          activeRoleCount: [
            // only match if a valid role was passed; otherwise match nothing (or everything — see note below)
            { $match: hasValidRole ? { roles: roleFilter, status: 100 } : { _id: null } },
            { $count: 'count' }, // ← uncommented, this was missing
          ],

          roleWiseCount: [
            { $unwind: '$roles' },
            {
              $group: {
                _id: '$roles',
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const result = stats[0];

    sendStandardResponse<any>(res, 'OK', {
      data: {
        totalCount: result.totalCount[0]?.count || 0,
        activeCount: result.activeCount[0]?.count || 0,
        activeRoleCount: result.activeRoleCount[0]?.count || 0,
        roleWiseCount: result.roleWiseCount.map((r: any) => ({
          role: r._id,
          count: r.count,
        })),
      },
      message: 'Successfully retrieved supporters',
    });
  } catch (error) {
    console.error('Error fetching supporter stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supporter stats',
      error,
    });
  }
});

supportersRouter.get('/top-donors', async (req, res) => {
  try {
    const  {min = 5000, max = 10000, limit = 10 } = req.query;

    const topSupporters = await Supporters.aggregate([
      // break out each transaction into its own doc
      { $unwind: "$transaction" },

      // convert amount (string) -> number, safely
      {
        $addFields: {
          "transaction.amountNum": {
            $convert: {
              input: "$transaction.amount",
              to: "double",
              onError: 0,
              onNull: 0
            }
          }
        }
      },

      // filter by amount range
      {
        $match: {
          "transaction.amountNum": {
            $gte: Number(min),
            $lte: Number(max)
          }
        }
      },

      // sort transactions high -> low
      { $sort: { "transaction.amountNum": -1 } },

      // one row per supporter (their highest qualifying transaction)
      {
        $group: {
          _id: "$_id",
          supporterCode: { $first: "$supporterCode" },
          name: { $first: "$name" },
          gender: { $first: "$gender" },
          contacts: { $first: "$contacts" },
          topAmount: { $first: "$transaction.amountNum" },
          transaction: { $first: "$transaction" }
        }
      },

      // final ranking
      { $sort: { topAmount: -1 } },
      { $limit: Number(limit) }
    ]);

    // res.status(200).json({
    //   success: true,
    //   count: topSupporters.length,
    //   data: topSupporters
    // });
     sendStandardResponse<any>(res, "OK", {
      data: topSupporters,
      message: "Successfully retrieved supporters",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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