dotenv.config();
import express from 'express';
import imgModel from '../db/models.js';
import fs from 'fs';
import dotenv from 'dotenv'
import path from 'path'
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


var router = express.Router();
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname+"/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + '.png');
  },
});

var upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } });

/* GET home page. */
router.get("/", async (req, res, next) => {
    const items = await imgModel.find({});
   
    return res.render('pages/home', { title: 'Etalk', items });
 
});

router.post("/", upload.single("image"), async function (req, res, next) {
  // const filePath = path.join(__dirname + '/uploads/' +req.file.filename);
  // const base64Img = imgData.toString('base64');
  var obj = {
    name: req.body.name,
    img: {
      data: req.file.filename,
      contentType: 'image/png'
    }
  };

  const exist = await imgModel.find({ name: req.body.name });
  if (exist.length > 0) {
    await imgModel.updateOne({ name: req.body.name }, obj);
    const back = await imgModel.find({});
    return res.render("pages/home", { title: "Etalk", items: back });
  } else {
    const newItem = new imgModel(obj);
    await newItem.save();
    const items = await imgModel.find({});
    
    return res.render('pages/home', { title: 'Etalk', items });
  }
});

router.get("/img/:name", async function (req, res) {
  const img = await imgModel.findOne({ name: req.params.name });

  res.status(200).json(img);
});

router.get("/health-check", (req, res) => {
  res.json({ error: false, message: "I'm alive" });
});

export default router;
