import {Router} from "express"
const router = Router();
const authmeController = require("../controllers/authController");
const projectController = require("../controllers/projectController");

router.use("/", projectController);
router.use("/authme", authmeController);

module.exports = router;
