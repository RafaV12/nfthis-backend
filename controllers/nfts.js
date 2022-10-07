const User = require("../models/User");
const Nft = require("../models/Nft");
const { cloudinary } = require("../utils/cloudinary");
const { StatusCodes } = require("http-status-codes");
const { BadRequest } = require("../errors");

const createNft = async (req, res) => {
  const { title, description, category, price, username } = req.body;
  const fileStr = req.body.image;
  if (!fileStr) {
    throw new BadRequest("No file found");
  }
  const uploadResponse = await cloudinary.uploader.upload(fileStr, {
    upload_preset: "nfthis",
    folder: "nfthis",
  });

  let newNft = {
    image: uploadResponse.secure_url,
    title,
    category,
    description,
    price,
    owner: username,
  };

  const nft = await Nft.create({ ...newNft });

  const user = await User.findOne({ username });
  const { _id } = user;

  await User.updateOne({ _id }, { nfts: [...user.nfts, nft._id] });

  res.status(StatusCodes.CREATED).json({ nft });
};

const updateNft = async (req, res) => {
  res.send("Update NFT");
};

const deleteNft = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequest("NFT ID not found!");
  }

  // Delete the NFT from the NFT collection
  await Nft.findByIdAndDelete(id);

  // Find the owner and delete the NFT from his NFT's array
  await User.updateOne(
    { nfts: { $in: id } },
    { $pull: { nfts: id } },
    { safe: true, multi: false }
  );

  res.status(StatusCodes.OK).json({ msg: "NFT deleted successfully" });
};

module.exports = { createNft, updateNft, deleteNft };
