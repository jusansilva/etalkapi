var express = require("express");
var router = express.Router();
var imgModel = require("../db/models");
var fs = require("fs");
require("dotenv/config");
var path = require("path");

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "routes/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

/* GET home page. */
router.get("/", async (req, res, next) => {
  console.log("to aqui");
  const items = await imgModel.find({});
  console.log(items);
  return res.render("pages/home", { title: "Etalk", items: items });
});

router.post("/", upload.single("image"), async function (req, res, next) {
  var obj = {
    name: req.body.name,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };

  const exist = await imgModel.find({ name: req.body.name });
  if (exist) {
    await imgModel.updateOne({ name: req.body.name }, obj);
    const back = await imgModel.find({});
    return res.render("pages/home", { title: "Etalk", items: back });
  } else {
    imgModel.create(obj, (err, item) => {
      if (err) {
        console.log(err);
      } else {
        // item.save();
        return res.render("pages/home", { title: "Etalk", items: item });
      }
    });
  }
});

router.get("/img/:name", async function (req, res) {
  const img = await imgModel.findOne({ name: req.params.name });

  res.status(200).json(img);
});

router.get("/health-check", (req, res) => {
  res.json({ error: false, message: "I'm alive" });
});

module.exports = router;
