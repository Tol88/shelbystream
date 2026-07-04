import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const uploaders = await redis.smembers("uploaders");
    return res.status(200).json(uploaders || []);
  }

  if (req.method === "POST") {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Address required" });
    await redis.sadd("uploaders", address);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}