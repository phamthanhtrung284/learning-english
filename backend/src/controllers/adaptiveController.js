import {
  generateAdaptivePlan
}
from "../services/adaptiveEngine.js";


export const getAdaptivePlan =
  async (req, res) => {

  try {

    const userId =
      req.user._id;

    const plan =
      await generateAdaptivePlan(
        userId
      );

    res.json(plan);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};