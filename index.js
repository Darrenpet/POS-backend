require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

mongoose.connect(process.env.DB_LINK, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

const app = express();
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const _rootUrl = req.get("host") + req.url;
  res.send({
    msg: "Welcome to the API. Check the routes object ",
    routes: {
      contact: `${_rootUrl}contact`,
    },
  });
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.listen(app.get("port"), () => {
  console.log(`Listening for calls on port ${app.get("port")}`);
  console.log("Press Ctrl+C to exit server");
});
