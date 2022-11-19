import { Router, text } from "express";
const router = Router();
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
const authConfig = require("../config/auth.json");
import { PrismaClient, User } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth";

const prisma = new PrismaClient();

const regexPassword = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 3) {
    return res
      .status(400)
      .send({ error: "seu usuario precisa ter minimo de 3 caracteres" });
  }

  if (!regexPassword.exec(password)) {
    return res.status(400).send({
      error:
        "Sua senha precisa conter pelo menos 8 caracteres, um número e uma letra maiúscula.",
    });
  }
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
        account: {
          create: {
            balance: 100,
          },
        },
      },
      include: {
        account: true,
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
    include: {
      account: true,
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

router.post("/tranfer", authMiddleware, async (req, res) => {
  const { username, amount } = req.body;
  try {
    const transfer = await prisma.$transaction(async (tx) => {
      const recipementUser = await tx.user.findUnique({
        where: {
          username,
        },
      });

      if (!recipementUser) {
        throw new Error("Usuario não existe");
      }

      const senderUser = await tx.user.findUnique({
        where: {
          id: req.userId,
        },
        include: {
          account: true,
        },
      });

      if (!senderUser) {
        throw new Error("Usuario não existe");
      }

      if (senderUser.account.balance < amount) {
        throw new Error(
          "Você não tem dinheiro suficiente para realizar essa ação"
        );
      }

      const tranfer = await tx.transactions.create({
        data: {
          value: amount,
          debitedAccountId: senderUser.accountsId,
          creditedAccountId: recipementUser.accountsId,
        },
      });

      await tx.accounts.update({
        where: {
          id: senderUser.accountsId,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await tx.accounts.update({
        where: {
          id: recipementUser.accountsId,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return tranfer;
    });

    res.send({ message: "Transferência com sucesso", transfer });
  } catch (err) {
    res.send({ error: err.message });
  }
});

module.exports = router;
