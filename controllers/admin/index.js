const express = require("express");
const router = express.Router();


router.use("/matches", require("./matches"));
router.use("/match-questions", require("./matchQuestions"));
router.use("/rounds", require("./rounds"));
router.use("/round-questions", require("./roundQuestions"));
router.use("/teams", require("./teams"));
router.use("/players", require("./players"));
router.use("/analytics", require("./analytics"));
router.use("/media", require("./media"));
router.use("/users", require("./users"));

module.exports = router;
