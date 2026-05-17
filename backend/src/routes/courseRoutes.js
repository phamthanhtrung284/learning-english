import express from "express";

import c1Course
  from "../data/courses/c1-course.js";

const router =
  express.Router();

// GET COURSE
router.get(
  "/c1",

  (req, res) => {

    res.json(c1Course);
  }
);

export default router;