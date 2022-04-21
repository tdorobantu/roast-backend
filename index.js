import "dotenv/config";
import express from "express";
import { createCoupon } from "./redis.js";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/createCoupon", async (req, res) => {
  //   const test = {
  //     campaignId: "campaignId",
  //     couponId: "couponId",
  //     senderId: "senderId",
  //     receiverId: "receiverId",
  //   };
  const id = await createCoupon(req.body);
  res.send(id);
});

app.post("/test", (req, res) => {
  console.log("this is req.body: ", req.body);
  // const {campaignId, couponId } = req.body
  // res.send(campaignId)
  
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(
    `Server started on ${PORT} and the redis url is ${process.env.REDIS_URL}`
  )
);
