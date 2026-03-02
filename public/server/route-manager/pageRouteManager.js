/** Page Routes Definition*/
const express = require("express");
const router = express.Router();

/** Sample Route */
router.get("/", (req, res) => {
    res.send("Hello")
});

router.get("/login", (req, res) => {
    res.send("Login")
});

module.exports = router;
