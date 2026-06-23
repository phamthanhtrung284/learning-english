import express from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { getPlan } from "./adaptive.controller.js";

const router = express.Router();

router.get("/plan", protect, getPlan);

export const adaptiveRoutes = router;
