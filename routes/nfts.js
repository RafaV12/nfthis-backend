const express = require("express");
const router = express.Router();

const { createNft, updateNft, deleteNft } = require("../controllers/nfts");

router.post("/", createNft);
router.patch("/:id", updateNft);
router.delete("/:id", deleteNft);

module.exports = router;
