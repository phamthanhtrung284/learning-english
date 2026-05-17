import UserWord from "../models/UserWord.js";
import User from "../models/User.js";

export const saveWord = async (req, res) => {

  try {

    const {
      word,
      meaning,
      ipa,
      type,
      example,
      level
    } = req.body;

    const existing = await UserWord.findOne({
      userId: req.user.id,
      word
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Word already saved"
      });
    }

    const newWord = await UserWord.create({
      userId: req.user.id,
      word,
      meaning,
      ipa,
      type,
      example,
      level
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 5 } });

    res.json({
      success: true,
      word: newWord
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const getVocabulary = async (
  req,
  res
) => {

  try {

    const words = await UserWord.find({
      userId: req.user.id
    }).sort({
      createdAt: -1
    });

    res.json(words);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};