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

    // Admin dashboard quyền quản trị (CRUD truyện, import PDF, v.v.)
    isAdmin: {
      type: Boolean,
      default: false,
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
