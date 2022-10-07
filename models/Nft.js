const { Schema, model } = require("mongoose");

const nftSchema = Schema({
  image: {
    type: String,
    required: [true, "NFT image must be provided"],
  },
  title: {
    type: String,
    required: [true, "NFT title must be provided"],
  },
  category: {
    type: String,
    default: "Other",
  },
  description: {
    type: String,
    required: [true, "NFT description must be provided"],
  },
  price: {
    type: Number,
    required: [true, "NFT price must be provided"],
  },
  owner: { type: Schema.Types.String, ref: "User" },
  featured: { type: Boolean, default: false },
  inAuction: { type: Boolean, default: false },
});

module.exports = model("Nft", nftSchema);
