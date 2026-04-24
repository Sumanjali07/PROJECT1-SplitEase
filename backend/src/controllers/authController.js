const User = require("../models/User");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  await new User({ email, password }).save();
  res.json({ message: "User created" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) return res.status(400).json({ message: "Invalid" });

  res.json({ message: "Success" });
};