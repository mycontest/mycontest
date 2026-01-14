const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");

router.get("/", controller.fnHome);
router.get("/contest", controller.fnContestList);
router.get("/contestadd", controller.fnContestForm);
router.post("/contestadd", controller.fnContestSave);
router.get("/deltasks", controller.fnContestRemoveTask);
router.post("/addtasks", controller.fnContestAddTask);
router.get("/tasks", controller.fnTaskList);
router.get("/tasksadd", controller.fnTaskForm);
router.post("/tasksadd", controller.fnTaskSave);
router.post("/taskszip", controller.fnTaskUpload);

module.exports = router;
