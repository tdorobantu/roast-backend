import "dotenv/config";
import express from "express";
import { remove } from "./redis.js";
import bodyParser from "body-parser";
import cors from "cors";
import { createCampaignAPI } from "./controllers/campaign.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.delete("/:id", async (req, res) => {
  await remove(req.params.id);
  res.send(req.params.id);
});

app.post("/create", createCampaignAPI);

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
