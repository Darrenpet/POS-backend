require("dotenv").config;

const express = require("express");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUser, getProduct } = require("../middleware/get");
const authenticateToken = require("../middleware/auth");

const app = express.Router();

// GET all users
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET one user
app.get("/:id", getUser, (req, res, next) => {
  res.send(res.user);
});

// LOGIN user with email + password
app.patch("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) res.status(404).json({ message: "Could not find user" });
  if (await bcrypt.compare(password, user.password)) {
    try {
      const access_token = jwt.sign(
        JSON.stringify(user),
        process.env.MONGO_PASS
      );
      res.status(201).json({ jwt: access_token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res
      .status(400)
      .json({ message: "Email and password combination do not match" });
  }
});

// REGISTER a user
app.post("/", async (req, res, next) => {
  const { fullname, email, password, phone_number } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    fullname,
    email,
    password: hashedPassword,
    phone_number,
  });

  try {
    const newUser = await user.save();

    try {
      const access_token = jwt.sign(
        JSON.stringify(newUser),
        process.env.MONGO_PASS
      );
      res.status(201).json({ jwt: access_token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a user
app.put("/:id", getUser, async (req, res, next) => {
  const { fullname, phone_number, password } = req.body;
  if (fullname) res.user.fullname = fullname;
  if (phone_number) res.user.phone_number = phone_number;
  if (password) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    res.user.password = hashedPassword;
  }

  try {
    const updatedUser = await res.user.save();
    res.status(201).send(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a user
app.delete("/:id", getUser, async (req, res, next) => {
  try {
    await res.user.remove();
    res.json({ message: "Deleted user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USER CART
app.get("/:id/cart", [authenticateToken, getUser], (req, res, next) => {
  try {
    res.json(req.user.cart);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ADD TO USER CART
app.put(
  "/:id/cart",
  [authenticateToken, getProduct],
  async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const inCart = user.cart.some((prod) => prod._id == req.parms.id);

    if (inCart) {
      const product = user.cart.find((prod) => prod._id == req.params.id);
      product.qyt += req.body.qty;

      const updateUser = await user.save();

      return res.send(updateUser.cart);
    } else {
      user.cart.push({ ...res.product, qty: req.body.qty });
      const updatedUser = await user.save();
      return res.send(updatedUser.cart);
    }
  }
);

// UPDATE USER CART
app.put(
  "/:id/cart",
  [authenticateToken, getProduct],
  async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const inCart = user.cart.some((prod) => prod._id == req.parms.id);

    if (inCart) {
      const product = user.cart.find((prod) => prod._id == req.params.id);
      product.qyt += req.body.qty;

      const updateUser = await user.save();

      return res.send(updateUser.cart);
    } else {
      user.cart.push({ ...res.product, qty: req.body.qty });
      const updatedUser = await user.save();
      return res.send(updatedUser.cart);
    }
  }
);

// DELETE USER CART

module.exports = app;
