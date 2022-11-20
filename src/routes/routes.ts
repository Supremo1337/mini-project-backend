import { Router } from "express";
export const router = Router();
const projectController = require("../controllers/projectController");
const authmeController = require("../controllers/authController");
const transferController = require("../controllers/transferController");

router.use("/", projectController);
router.use("/authme", authmeController);
router.use("/money", transferController);
