import { Router } from "express";
const router = Router();
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
const authConfig = require("../config/auth.json");
import { PrismaClient, User } from "@prisma/client";

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

// router.get("/users", async (req, res) => {
//   console.log(req.query.token);
//   const user = await users.findOne({
//     token: req.query.token.replace('"', "").replace('"', ""),
//   });
//   console.log(user);
//   if (user) return res.status(200).json({ error: false, user });
//   else
//     return res
//       .status(200)
//       .json({ error: true, message: "nenhuma ficha registrada pelo usuário" });
// });

// router.post("/authenticate", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await users.findOne({ email }).select("+password");

//   if (!user) return res.status(400).send({ error: "User not found" });

//   if (!(await bcrypt.compare(password, user.password)))
//     return res.status(400).send({ erro: "invalid password" });

//   user.password = undefined;
//   const token = generateToken({ id: user.id });
//   await user.updateOne({ token: token });
//   const fichaUser = await ficha.findOne({ email });
//   res.status(200).send({ error: false, user, token: token, fichaUser });
// });

module.exports = router;
