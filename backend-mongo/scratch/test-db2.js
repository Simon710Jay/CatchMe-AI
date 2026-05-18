const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log("URI Starts with:", uri.substring(0, 40) + "...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error("ERROR:", err.message);
    process.exit(1);
  });
