import mongoose
  from "mongoose";

const userSchema =
  new mongoose.Schema({

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    level: {
      type: String,

      default: "C1"
    },

    xp: {
      type: Number,

      default: 0
    },

    streak: {
      type: Number,
      default: 0,
    },

    password: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true
  }
);

export default mongoose.model(
  "User",
  userSchema
);