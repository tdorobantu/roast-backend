import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes.js";
import { initiateRedis } from "./redis/redis.js";
import https from "https";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use("/api", router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server started on ${PORT} and the redis url is ${process.env.REDIS_URL}`
  );
  initiateRedis();
});

// app.on('listening', function() {
//   initiateRedis();
// })
