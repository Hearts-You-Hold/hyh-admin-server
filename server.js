//-----BOILER PLATE -- CONNECTING TO EXPRESS SERVER ------//
const express = require("express");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const port = process.env.PORT || 8004;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//-------END BOILER PLATE----------------------//

//bringing in schema
const requestSchema = require("./data.js");
const { send } = require("express/lib/response");

//model for schema instances
const Request = mongoose.model("RequestItem", requestSchema);



const publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA4OTh4QOlhw/qa1xbZiz+
mEJr7mGOxkpBwYzv6BkKHrw+fYx0y+95UV9AcvblMEsQZEv+9gyW0nxWTI2GUPw7
Lzsu4+mdcCTLb7wubMOdYwLVpRjoS1Gsky/tJswxrV2D1565F8MIYuxw1ynFSBFM
xoSJhVaTUtUbsV9QyUb7c4mk8inE0DzZmV59PPVWXBLtaE94/OBqR1Y2I2LBDmlH
7L6II2ZUlFRtHEmyVakqlx3PSk+JreNhSDFfJECauDCvhDGI3eew4PSjcfb6SjzU
e0TLdL4zjt6zZuAGT1M9K87q9/x9xj8Ik+2IVxWfv5nOuSjxLMmvxl/Le9kUDVew
feluab67GIPyMaIvPs6QkRjNvWu3FajLi3tOPges19j+AsABVt/8RweEgvvvHmAK
r5/fRpQosrBSKHB9YBr83zPS4NhacpFQC60FtDLEe3x9nUqzoM9/+i0Y2Gq/YcJZ
fGLdheqBugDtLC/uYzpzMjjMBUKXr4Ec65h0wYT3yrwJg6cPRSRhssJ7ahb8HbHA
sVcLHXGxYp+Hr8YLo7l27l53tOzGnkOxweY+IcImsf9A9FboSVUIOys/WP2bep3u
WTeq9Cihk61xYDdF+prWSeuThwM+c0ljSEYrgBbRHUzG2qgxbkQVjnvyGexy/j9B
QjH7q20RHQ21mrav02qc24MCAwEAAQ==
-----END PUBLIC KEY-----`;

// Verify the token
const verifiedPayload = jwt.verify(accessToken, publicKey, {
  algorithms: ["RS256"],
});

function authenticateToken(req, res, next) {
  // Read the JWT access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // Return 401 if no token

  // Verify the token using the Userfront public key
  jwt.verify(token, process.env.USERFRONT_PUBLIC_KEY, (err, auth) => {
    if (err) return res.sendStatus(403); // Return 403 if there is an error verifying
    req.auth = auth;
    next();
  });
}

//creating API route for the front end to access ALL NOT FUNDED entries from the database
app.get("/", async (request, response) => {
  //assigning the result of a find on our Model to a variable
  let notFunded = await Request.find({ isFunded: false });
  // logging all requestItems
  response.json(notFunded);
});

//creating API route for the front end to access ALL FUNDED entries from the database
app.get("/funded-requests", async (request, response) => {
  //assigning the result of a find on our Model to a variable
  let isFunded = await Request.find({ isFunded: true });
  // logging all requestItems
  response.json(isFunded);
});

app.post("/", async (request, response) => {
  try {
    let itemName = request.body.itemName;
    let itemPrice = request.body.itemPrice;
    let donationDescription = request.body.donationDescription;
    let isFunded = request.body.isFunded;
    let recipientName = request.body.recipientName;
    let recipientUSLocation = request.body.recipientUSLocation;
    let dateCreated = request.body.dateCreated;
    let comments = request.body.comments;
    let recipientState = request.body.recipientState;
    let itemCategory = request.body.itemCategory;

    const requestItem = new Request({
      itemName: itemName,
      itemPrice: itemPrice,
      donationDescription: donationDescription,
      isFunded: isFunded,
      recipientName: recipientName,
      recipientUSLocation: recipientUSLocation,
      dateCreated: dateCreated,
      comments: comments,
      recipientState: recipientState,
      itemCategory: itemCategory,
    });

    requestItem.save();

    response.status(200);
  } catch (error) {
    response.status(404);
    send("Request not found");
  }
});

app.post("/edit", async (request, response) => {
  try {
  let itemId = request.body.itemId;
  itemId = ObjectId(itemId);
  let itemName = request.body.itemName;
  let itemPrice = request.body.itemPrice;
  let donationDescription = request.body.donationDescription;
  let isFunded = request.body.isFunded;
  let recipientName = request.body.recipientName;
  let recipientUSLocation = request.body.recipientUSLocation;
  let dateCreated = request.body.dateCreated;
  let comments = request.body.comments;
  let recipientState = request.body.recipientState;
  let itemCategory = request.body.itemCategory;
  let updateTarget = itemId;
  await Request.updateOne(
    { _id: updateTarget },
    {
      $set: {
        itemName: itemName,
        itemPrice: itemPrice,
        donationDescription: donationDescription,
        isFunded: isFunded,
        recipientName: recipientName,
        recipientUSLocation: recipientUSLocation,
        dateCreated: dateCreated,
        comments: comments,
        recipientState: recipientState,
        itemCategory: itemCategory,
      },
    }
  );
  response.json("/");
  }catch (error) {
    response.status(404)
    send("Request not found")
  }
});

app.post("/delete", async (req, res) => {
  try {
  let itemId = req.body.itemId;
  itemId = ObjectId(itemId);
  await Request.findOneAndDelete({ _id: itemId });
  res.json("/");
  } catch (error) {
    res.status(404)
    send("Request not found")
  }
});

app.post("/unpublish", async (request, response) => {
  try {
    let itemId = request.body.itemId;
    itemId = ObjectId(itemId);
    let isFunded = request.body.isFunded;
    let published = request.body.published;
    let itemName = request.body.itemName;
    let itemPrice = request.body.itemPrice;
    let donationDescription = request.body.donationDescription;
    let recipientName = request.body.recipientName;
    let recipientUSLocation = request.body.recipientUSLocation;
    let dateCreated = request.body.dateCreated;
    let comments = request.body.comments;
    let recipientState = request.body.recipientState;
    let itemCategory = request.body.itemCategory;
    await Request.updateOne(
      { _id: itemId },
      {
        $set: {
          isFunded: isFunded,
          published: published,
          itemName: itemName,
          itemPrice: itemPrice,
          donationDescription: donationDescription,
          recipientName: recipientName,
          recipientUSLocation: recipientUSLocation,
          dateCreated: dateCreated,
          comments: comments,
          recipientState: recipientState,
          itemCategory: itemCategory,
        },
      }
    );
    response.json("/");
  } catch (error) {
    response.status(404);
    send("Request not found");
  }
});

app.get("/unpublish", async (request, response) => {
  let unpublished = await Request.find({ published: false });
  response.json(unpublished);
});

app.post("/publish", async (request, response) => {
  try {
    let itemId = request.body.itemId;
    itemId = ObjectId(itemId);
    let isFunded = request.body.isFunded;
    let published = request.body.published;
    let itemName = request.body.itemName;
    let itemPrice = request.body.itemPrice;
    let donationDescription = request.body.donationDescription;
    let recipientName = request.body.recipientName;
    let recipientUSLocation = request.body.recipientUSLocation;
    let dateCreated = request.body.dateCreated;
    let comments = request.body.comments;
    let recipientState = request.body.recipientState;
    let itemCategory = request.body.itemCategory;
    await Request.updateOne(
      { _id: itemId },
      {
        $set: {
          isFunded: isFunded,
          published: published,
          itemName: itemName,
          itemPrice: itemPrice,
          donationDescription: donationDescription,
          recipientName: recipientName,
          recipientUSLocation: recipientUSLocation,
          dateCreated: dateCreated,
          comments: comments,
          recipientState: recipientState,
          itemCategory: itemCategory,
        },
      }
    );
    response.json("/");
  } catch (error) {
    response.status(404);
    send("Request not found");
  }
});

app.listen(port, () => {
  console.log("listening on port: " + port);
});
