import "dotenv/config";
import express from "express";
import { router } from "./routes/routes";
import cors from "cors";

const server = express();
server.use(express.json()); // faz com que o express entenda JSON
server.use(cors());
server.use("/api", router);
server.listen(3333, () => console.log("Server is running in 3333"));
