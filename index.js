import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes.js";
import { initiateRedis } from "./redis/redis.js";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://localhost:3000"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

app.use("/api", router);

const PORT = process.env.PORT || 4000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4001;

app.listen(PORT, () => {
  console.log(
    `Server started on ${PORT} and the redis url is ${process.env.REDIS_URL}`
  );
  initiateRedis();
});

https
  .createServer(
    // Provide the private and public key to the server by reading each
    // file's content with the readFileSync() method.
    {
      key: fs.readFileSync("./certificates/key.pem"),
      cert: fs.readFileSync("./certificates/cert.pem"),
    },
    app
  )
  .listen(HTTPS_PORT, () => {
    console.log(
      `Server started on ${HTTPS_PORT} and the redis url is ${process.env.REDIS_URL}`
    );
    initiateRedis();
  });
