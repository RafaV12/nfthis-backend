const express = require("express");
const router = express.Router();

const {
  getAllNfts,
  getNft,
  getAllUsers,
  getUser,
} = require("../controllers/api");

router.get("/nfts", getAllNfts);
router.get("/nft/:id", getNft);
router.get("/users", getAllUsers);
router.get("/user/:username", getUser);

module.exports = router;
