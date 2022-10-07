const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
  firstname: {
    type: String,
    maxlength: 10,
    minlength: [3, "name must be at least 3 chars"],
    collation: { locale: "en_US", strength: 2 },
  },
  lastname: {
    type: String,
    maxlength: 10,
    minlength: [3, "lastname must be at least 3 chars"],
    collation: { locale: "en_US", strength: 2 },
  },
  username: {
    type: String,
    required: [true, "Please provide a valid username"],
    maxlength: 50,
    minlength: [4, "Username must be at least 4 chars"],
    collation: { locale: "en_US", strength: 2 },
    unique: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 chars"],
  },
  followers: [
    {
      type: Schema.Types.String,
      ref: "User",
    },
  ],
  following: [
    {
      type: Schema.Types.String,
      ref: "User",
    },
  ],
  nfts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Nft",
    },
  ],
  recommended: { type: Boolean, default: true },
});

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.comparePasswords = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
  return isMatch;
};

module.exports = model("User", UserSchema);
