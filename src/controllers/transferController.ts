import { Router } from "express";
const router = Router();
const authConfig = require("../config/auth.json");
import { PrismaClient, User, Prisma } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

router.post("/transfer", authMiddleware, async (req, res) => {
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

router.get("/transactions", authMiddleware, async (req, res) => {
  const conditions: Prisma.TransactionsFindManyArgs = {
    where: {
      OR: [
        {
          creditedAccountId: req.accountsId,
        },
        {
          debitedAccountId: req.accountsId,
        },
      ],
    },
    include: {
      creditedAccount: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      debitedAccount: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  };

  if (req.query.type === "Cash-in") {
    delete conditions.where.OR[1];
  }

  if (req.query.type === "Cash-out") {
    delete conditions.where.OR[0];
  }

  if (req.query.date) {
    const currentDate = new Date(req.query.date as any);
    const startDay = startOfDay(currentDate);
    const endDay = endOfDay(currentDate);

    conditions.where.AND = {
      createdAt: {
        gte: startDay,
        lte: endDay,
      },
    };
  }

  const transactions = await prisma.transactions.findMany(conditions);

  res.send({
    message: "Transaçoes consultadas",
    userId: req.userId,
    accountId: req.accountsId,
    transactions,
  });
});

module.exports = router;
