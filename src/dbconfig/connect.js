const mongoose = require("mongoose");

require("dotenv").config();

async function Connect() {
  try {
    const db = process.env.MONGO_URL;
    const success = await mongoose.connect(db);
    success && console.log("connected successfully");
  } catch (error) {
    console.log("Cannot Connect", error);
  }
}

module.exports = Connect;
