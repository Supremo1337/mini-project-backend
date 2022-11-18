const router = require("express").Router();
const authmeController = require("../controllers/authController");
const projectController = require("../controllers/projectController");

router.use("/", projectController);
router.use("/authme", authmeController);
// router.use("/ficha", require("./controllers/fichaController"));

module.exports = router;
