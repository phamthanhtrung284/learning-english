import express
  from "express";

import {
  protect
}
from "../middleware/authMiddleware.js";

import {
  getAdaptivePlan
}
from "../controllers/adaptiveController.js";

const router =
  express.Router();

router.get(
  "/plan",

  protect,

  getAdaptivePlan
);

export default router;