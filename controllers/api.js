const Nft = require('../models/Nft');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, UnauthenticatedError } = require('../errors');

const getAllNfts = async (req, res) => {
  const nfts = await Nft.find({});
  if (nfts.length === 0) {
    throw new BadRequest('There are no NFTs yet');
  }
  res.status(StatusCodes.OK).json(nfts);
};

const getNft = async (req, res) => {
  const { id } = req.params;
  const nft = await Nft.findById(id);

  if (!nft) {
    throw new BadRequest('NFT not found!');
  }

  // API ready NFT.
  let apiNft = {
    _id: nft._id,
    image: nft.image,
    title: nft.title,
    category: nft.category,
    description: nft.description,
    price: nft.price,
    owner: nft.owner,
  };

  res.status(StatusCodes.OK).json(apiNft);
};

const getAllUsers = async (req, res) => {
  const dbUsers = await User.find({});
  let apiUsers = dbUsers.map((user) => {
    const { _id, username, nfts, following, followers, recommended } = user;
    return { _id, username, nfts, following, followers, recommended };
  });
  if (apiUsers.length === 0) {
    throw new BadRequest('There are no users yet');
  }
  res.status(StatusCodes.OK).json(apiUsers);
};

const getUser = async (req, res) => {
  const { username } = req.params;
  const dbUser = await User.findOne({ username });
  if (!dbUser) {
    throw new BadRequest('User not found!');
  }
  const { firstname, lastname, following, followers } = dbUser;

  const nfts = await Nft.find({ owner: username });

  let apiUser = {
    firstname,
    lastname,
    username,
    nfts,
    following,
    followers,
  };

  res.status(StatusCodes.OK).json(apiUser);
};

module.exports = { getAllNfts, getNft, getAllUsers, getUser };
