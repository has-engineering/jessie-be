const { Router } = require("express");
const UserController = require("./controllers/user");

module.exports = app => {
  const userRoutes = Router();
  const apiRoutes = Router();

  app.use("/users", userRoutes);
  userRoutes.get("/", UserController.getUsers);
  userRoutes.get("/:id", UserController.getUserById);

  app.use("/", apiRoutes);
};
