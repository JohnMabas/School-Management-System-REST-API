const express = require("express");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/classController");
const { create, update, idParam, listQuery } = require("../validators/classValidator");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("admin"), validate(create), controller.create);
router.get("/", validate(listQuery, "query"), controller.list);
router.get("/:id", validate(idParam, "params"), controller.getById);
router.put("/:id", authorize("admin"), validate(idParam, "params"), validate(update), controller.update);
router.delete("/:id", authorize("admin"), validate(idParam, "params"), controller.remove);

module.exports = router;
