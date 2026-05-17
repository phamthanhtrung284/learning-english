import express
  from "express";

import {
  saveWordResult
}
from "../controllers/progressController.js";
import {
  protect
}
from "../middleware/authMiddleware.js";



const router =
  express.Router();

router.post(
  "/word-result",

  protect,

  saveWordResult
);

export default router;