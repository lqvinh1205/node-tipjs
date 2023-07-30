const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
