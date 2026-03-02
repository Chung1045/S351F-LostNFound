/** Credential API Routes */

const express = require("express");
const router = express.Router();

/** Sample Route */
router.post("/", (req, res) => {
    res.status(200).send({"message": "Hello from credentialManager route"})
});

module.exports = router;
