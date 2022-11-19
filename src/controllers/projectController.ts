import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  res.send({ ok: true, user: req.userId });
});

module.exports = router;
