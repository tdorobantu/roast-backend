import { createCoupon } from "../redis";

export default async function handler(req, res) {
  const id = await createCoupon(req.body);
  res.status(200).json({ id });
}
