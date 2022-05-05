//----BOILER PLATE -- CONNECTING TO MONGO DATABASE ---//
require("dotenv").config();
let MONGO_URI = process.env.MONGO_URI
const mongoose = require('mongoose')

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", console.error.bind("connection error"));
//----------- END BOILER PLATE -------//


const requestSchema = new mongoose.Schema({

   itemName: String,
   itemPrice: Number,
   donationDescription: String,
   isFunded: Boolean,
   recipientName: String,
   recipientUSLocation: String,
   dateCreated: Date,
   comments: String,
   recipientState: String,
   itemCategory: String,
   published: Boolean

})

module.exports = requestSchema
