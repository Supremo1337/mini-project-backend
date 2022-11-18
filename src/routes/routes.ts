import {Router} from "express"
const router = Router();
const authmeController = require("../controllers/authController");
const projectController = require("../controllers/projectController");
import { PrismaClient } from "@prisma/client";

router.use("/", projectController);
router.use("/authme", authmeController);
// router.use("/ficha", require("./controllers/fichaController"));

module.exports = router;
