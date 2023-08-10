const userRouter = require("express").Router();
const User = require("./userModel");
const bcrypt = require("bcrypt");

userRouter.get("/", async (request, response) => {
  let users = await User.find({});
  // console.log("asasdd");
  response.json(users);
});

userRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id);
  response.json(user);
});

userRouter.post("/", async (request, response, next) => {
  let user = new User(request.body);

  if (user.password.length < 3) {
    const error = new Error("Password must have minimum length of 3");
    error.name = "ValidationError";
    return next(error);
  }

  const saltRounds = 10;
  user.password = await bcrypt.hash(user.password, saltRounds);

  await user.save();
  response.status(201).json(user);
});

userRouter.put("/:id/add", async (request, response) => {
  const minutesFocused = request.body.minutesFocused;
  const user = await User.findById(request.params.id);
  const today = new Date();
  const curDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const existingRigor = user.rigor.find((r) => +r.date === +curDay);

  if (existingRigor) {
    existingRigor.minutesFocused += minutesFocused;
  } else {
    user.rigor.push({
      date: curDay,
      minutesFocused: minutesFocused,
    });
  }

  await user.save();
  response.status(200).send("Minutes added successfully!");
});

module.exports = userRouter;