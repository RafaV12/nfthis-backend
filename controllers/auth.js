const User = require('../models/User');
const Nft = require('../models/Nft');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, UnauthenticatedError } = require('../errors');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  const { username, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = {
    username: username.toLowerCase(),
    passwordHash,
  };
  const user = await User.create(newUser);

  const userId = user._id;

  const token = user.createJWT();
  res
    .status(StatusCodes.CREATED)
    .json({ user: { username: user.username }, token, userId });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequest('Please provide username and password');
  }

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordCorrect = await user.comparePasswords(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const token = user.createJWT();

  const nfts = await Nft.find({ owner: username.toLowerCase() });

  res.status(StatusCodes.OK).json({
    user: {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      nfts,
      following: user.following,
      followers: user.followers,
    },
    token,
    userId: user._id,
  });
};

const profile = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById(userId);
  const nfts = await Nft.find({ user: userId });

  const loggedUser = {
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    followers: user.followers,
    following: user.following,
    nfts,
  };

  res.status(StatusCodes.OK).json(loggedUser);
};

const settings = async (req, res) => {
  const { firstName, lastName, newUsername, userId } = req.body;

  if (firstName) {
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        firstname: firstName,
      }
    );
  }

  if (lastName) {
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        lastname: lastName,
      }
    );
  }

  if (newUsername) {
    // Check if the logged user's id is valid
    if (!userId) {
      throw new UnauthenticatedError('User ID not found!');
    }

    // Check if the new username does not exist already in our database.
    const newUsernameExists = await User.exists({ username: newUsername });
    if (newUsernameExists) {
      throw new BadRequest('New username already in use');
    }

    // User that will be updated with the new username
    const userToChange = await User.findById(userId);

    // Remember that once the user changes his username
    // everything associated with the old one will need
    // to be updated, that means, NFT's owner's name and
    // username inside the following and followers arrays.
    // Look if our soon-to-be old username exists in someone's following array
    await User.updateMany(
      { following: { $in: userToChange.username } },
      {
        $set: {
          'following.$': newUsername,
        },
      }
    );
    // Look if our soon-to-be old username exists in someone's followers' array
    await User.updateMany(
      { followers: { $in: userToChange.username } },
      {
        $set: {
          'followers.$': newUsername,
        },
      }
    );
    // Look if the user owns any NFT that needs the 'owner' name changed
    await Nft.updateMany(
      { owner: userToChange.username },
      {
        owner: newUsername,
      }
    );
    // Update the username once the other changes are done
    await User.updateOne(
      { username: userToChange.username },
      { username: newUsername.toLowerCase() }
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ newUsername, msg: 'Username updated successfully' });
};

const followOrUnfollowUser = async (req, res) => {
  // Get logged user's id and the user's he wants to follow
  const { loggedUserId, userToFollowId, userToUnfollowId } = req.body;
  const loggedUser = await User.findOne({ username: loggedUserId });
  const { following } = loggedUser;

  // Check if we are getting a userToFollowId OR a userToUnfollowId,
  // that will decide if we are going to follow or unfollow a user
  if (userToFollowId) {
    const userToFollow = await User.findOne({ username: userToFollowId });
    // Check if we aren't following the user already
    if (following.includes(userToFollowId)) {
      throw new BadRequest('User is being followed already');
    }

    // Update 'following' array of the logged user to include the followed user
    await User.updateOne(
      { username: loggedUserId },
      { following: [...loggedUser.following, userToFollowId] }
    );

    // Update 'followers' array of the followed user to include the logged user
    await User.updateOne(
      { username: userToFollowId },
      { followers: [...userToFollow.followers, loggedUserId] }
    );
    return res.status(StatusCodes.OK).json({ msg: 'Followed successfully' });
  }

  if (userToUnfollowId) {
    const userToUnfollow = await User.findOne({ username: userToUnfollowId });
    // Check if we are actually following the user, so we can unfollow
    if (!following.includes(userToUnfollowId)) {
      throw new BadRequest('User is not being followed');
    }

    // Filter 'following' array of the logged user to remove the followed user
    let filteredFollowing = following.filter((id) => id !== userToUnfollowId);
    await User.updateOne(
      { username: loggedUserId },
      {
        following: filteredFollowing,
      }
    );

    // Filter 'followers' array of the unfollowed user to remove the logged user
    let filteredFollowers = userToUnfollow.followers.filter(
      (id) => id !== loggedUserId
    );
    await User.updateOne(
      { username: userToUnfollowId },
      {
        followers: filteredFollowers,
      }
    );

    return res.status(StatusCodes.OK).json({ msg: 'Unfollowed successfully' });
  }
};

module.exports = {
  register,
  login,
  profile,
  settings,
  followOrUnfollowUser,
};
