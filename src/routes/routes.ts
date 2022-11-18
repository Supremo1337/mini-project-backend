const router = require("express").Router();
const authmeController = require("../controllers/authController");
const projectController = require("../controllers/projectController");

router.use("/", projectController);
router.use("/authme", authmeController);
// router.use("/ficha", require("./controllers/fichaController"));

router.get("/health", (req, res) => {
    console.log(res)
    return res.json("up")
})

module.exports = router;
