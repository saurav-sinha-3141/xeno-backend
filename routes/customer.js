const express = require("express");
const routerCustomer = express.Router();
const { body, query, validationResult } = require("express-validator");
const Customer = require("../models/Customer");

/*==================================
ROUTE 1: Add new customer info using
POST: "/api/customer/addcustomer"
==================================*/

routerCustomer.post(
  "/addcustomer",
  [
    body("uid").notEmpty().withMessage("Please login to add new customer"),
    body("name").notEmpty().withMessage("Customer name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("age")
      .isInt({ min: 1, max: 150 })
      .withMessage("Age must be between 1 and 150"),
    body("gender")
      .optional()
      .isIn(["", "male", "female", "other"])
      .withMessage("Gender must be 'male', 'female','other' or ''"),
    body("lastVisit")
      .optional()
      .isDate()
      .withMessage("Last visit must be a valid date")
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error("Last visit cannot be a future date");
        }
        return true;
      }),
    body("totalVisits")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total visits must be a non-negative number"),
    body("latestPurchase")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Latest purchase amount must be a non-negative number"),
    body("totalPurchase")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Total purchase amount must be a non-negative number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      uid,
      name,
      email,
      age,
      gender,
      lastVisit,
      totalVisits,
      latestPurchase,
      totalPurchase,
    } = req.body;

    try {
      const existingCustomer = await Customer.findOne({
        email,
        uid,
      });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ error: "Customer with this email already exists" });
      }
      const customer = await Customer.create({
        uid,
        name,
        email,
        age,
        gender,
        lastVisit,
        totalVisits,
        latestPurchase,
        totalPurchase,
      });

      res.status(201).json({
        success: true,
        status: "Customer created successfully",
        customer,
      });
    } catch (error) {
      console.error("Error in /addcustomer:", error.message);
      res.status(500).json({
        success: false,
        error: `Internal server error. Error in /addcustomer: ${error.message}`,
      });
    }
  }
);
/*==================================
END ROUTE 1
==================================*/

/*==================================
ROUTE 2: Get customers based on filters using
GET: "/api/customer/filter"
==================================*/

routerCustomer.get(
  "/filter",
  [
    query("uid").notEmpty().withMessage("Please sign in"),
    query("minAge")
      .optional()
      .isInt({ min: 0 })
      .withMessage("minAge must be a non-negative integer"),
    query("maxAge")
      .optional()
      .isInt({ min: 0 })
      .withMessage("maxAge must be a non-negative integer"),
    query("gender")
      .optional()
      .isIn(["male", "female", "other"])
      .withMessage("gender must be 'male', 'female', or 'other'"),
    query("lastVisitBefore")
      .optional()
      .isISO8601()
      .withMessage("lastVisitBefore must be a valid date"),
    query("lastVisitAfter")
      .optional()
      .isISO8601()
      .withMessage("lastVisitAfter must be a valid date"),
    query("minTotalVisits")
      .optional()
      .isInt({ min: 0 })
      .withMessage("minTotalVisits must be a non-negative integer"),
    query("maxTotalVisits")
      .optional()
      .isInt({ min: 0 })
      .withMessage("maxTotalVisits must be a non-negative integer"),
    query("minLatestPurchase")
      .optional()
      .isInt({ min: 0 })
      .withMessage("minLatestPurchase must be a non-negative integer"),
    query("maxLatestPurchase")
      .optional()
      .isInt({ min: 0 })
      .withMessage("maxLatestPurchase must be a non-negative integer"),
    query("minTotalPurchase")
      .optional()
      .isInt({ min: 0 })
      .withMessage("minTotalPurchase must be a non-negative integer"),
    query("maxTotalPurchase")
      .optional()
      .isInt({ min: 0 })
      .withMessage("maxTotalPurchase must be a non-negative integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        uid,
        minAge,
        maxAge,
        gender,
        lastVisitBefore,
        lastVisitAfter,
        minTotalVisits,
        maxTotalVisits,
        minLatestPurchase,
        maxLatestPurchase,
        minTotalPurchase,
        maxTotalPurchase,
      } = req.query;

      if (uid) {
        const filter = {};

        if (minAge || maxAge) {
          filter.age = {};
          if (minAge) filter.age.$gte = parseInt(minAge);
          if (maxAge) filter.age.$lte = parseInt(maxAge);
        }

        if (gender) {
          filter.gender = gender;
        }

        if (lastVisitBefore || lastVisitAfter) {
          filter.lastVisit = {};
          if (lastVisitBefore)
            filter.lastVisit.$lte = new Date(lastVisitBefore);
          if (lastVisitAfter) filter.lastVisit.$gte = new Date(lastVisitAfter);
        }

        if (minTotalVisits || maxTotalVisits) {
          filter.totalVisits = {};
          if (minTotalVisits)
            filter.totalVisits.$gte = parseInt(minTotalVisits);
          if (maxTotalVisits)
            filter.totalVisits.$lte = parseInt(maxTotalVisits);
        }

        if (minLatestPurchase || maxLatestPurchase) {
          filter.latestPurchase = {};
          if (minLatestPurchase)
            filter.latestPurchase.$gte = parseInt(minLatestPurchase);
          if (maxLatestPurchase)
            filter.latestPurchase.$lte = parseInt(maxLatestPurchase);
        }

        if (minTotalPurchase || maxTotalPurchase) {
          filter.totalPurchase = {};
          if (minTotalPurchase)
            filter.totalPurchase.$gte = parseInt(minTotalPurchase);
          if (maxTotalPurchase)
            filter.totalPurchase.$lte = parseInt(maxTotalPurchase);
        }

        const customers = await Customer.find({ uid, ...filter });

        res.status(200).json({
          success: true,
          status: `Customers found: ${customers.length}`,
          count: customers.length,
          data: customers,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Internal server error.Error in /filter: ${error.message}`,
      });
    }
  }
);
/*==================================
END ROUTE 2
==================================*/

module.exports = { routerCustomer };
