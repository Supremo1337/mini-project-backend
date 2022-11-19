const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.json");

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(400).send({ error: "No token provided" });

  const [, token] = authHeader.split(" ");

  if (!token) return res.status(401).sened({ error: "Token error" });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token invalid" });

    req.userId = decoded.id;
    return next();
  });
};
