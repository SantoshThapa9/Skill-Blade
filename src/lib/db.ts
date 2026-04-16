import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local.");
  }

  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? "skill_blade",
  });

  cache.conn = await cache.promise;
  return cache.conn;
}
