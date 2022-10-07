const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authentication");

const {
  login,
  register,
  profile,
  settings,
  followOrUnfollowUser,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, profile);
router.patch("/settings", authenticateUser, settings);
router.patch("/user/:username", authenticateUser, followOrUnfollowUser);

module.exports = router;
