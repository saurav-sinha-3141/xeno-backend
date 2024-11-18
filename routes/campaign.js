const express = require("express");
const routerCampaign = express.Router();
const { body, validationResult } = require("express-validator");
const Campaign = require("../models/Campaign");

/*==================================
ROUTE 1: Add new campaign
GET: "/api/campaign/addcampaign"
==================================*/

routerCampaign.post(
  "/addcampaign",
  [
    body("uid").notEmpty().withMessage("Please sign in"),
    body("message").isString().notEmpty().withMessage("Message is required."),
    body("query").isObject().notEmpty().withMessage("Query is required."),
    body("size")
      .isInt({ min: 1 })
      .withMessage("Size must be a positive number."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { uid, message, query, size } = req.body;

      const savedCampaign = await Campaign.create({
        uid,
        message,
        query,
        size,
      });

      res.status(201).json({
        success: true,
        status: "Campaign created successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Internal server error. Error in /addcampaign: ${error}`,
      });
    }
  }
);
/*==================================
END ROUTE 1
==================================*/

/*==================================
ROUTE 2: View campaign history
GET: "/api/campaign/viewcampaign"
==================================*/

routerCampaign.get("/viewcampaign", async (req, res) => {
  try {
    const { order = "asc" } = req.query;
    const { uid } = req.query;
    const sortOrder = order === "desc" ? -1 : 1;

    const campaigns = await Campaign.find({ uid }).sort({
      createdAt: sortOrder,
    });

    res.status(200).json({
      success: true,
      status: "Fetched previous campaigns",
      campaigns,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: `Internal server error.Error in /viewcampaign: ${error}`,
      });
  }
});
/*==================================
END ROUTE 2
==================================*/

module.exports = { routerCampaign };
