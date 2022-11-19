import { Router } from "express";
const router = Router();
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
const authConfig = require("../config/auth.json");
import { PrismaClient, User } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth";

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const checkUsernameExists = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (checkUsernameExists)
      return res.status(400).send({ error: "User already exists" });

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    delete user.password;

    return res.send({
      user,
      token: generateToken(user),
    });
  } catch (err) {
    console.log("USER AQ", req.body);
    console.log(err);
    return res.status(400).send({ error: "Registrarion failed" });
  }
});

function generateToken(user: User) {
  return sign({ id: user.id }, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.get("/user", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
  });

  if (!user)
    return res.status(200).json({ error: true, message: "erro no sistema" });

  delete user.password;

  res.json({ user });
});

router.post("/authenticate", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) return res.status(400).send({ error: "invalid password" });

  const compareWrittenPasswordIsIgualUserPassword = await compare(
    password,
    user.password
  );
  if (!compareWrittenPasswordIsIgualUserPassword)
    return res.status(400).send({ erro: "invalid password" });

  delete user.password;

  const token = generateToken(user);

  res.status(200).send({ error: false, user, token: token });
});

module.exports = router;
