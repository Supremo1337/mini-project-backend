import express, { Router } from "express";
const router = require("express").Router();

const server = express();
const routes = require("./routes/routes.ts");
var cors = require("cors");
server.use(express.json()); // faz com que o express entenda JSON
const { createProxyMiddleware } = require("http-proxy-middleware");
server.use(cors());
server.use(
  "/api",
  routes,
  createProxyMiddleware({
    target: "http://localhost:3333/",
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  })
);

server.use(express.urlencoded({ extended: true }));
server.listen(3333, () => console.log("Server is running in 3333"));

