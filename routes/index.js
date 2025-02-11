import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import imgModel from '../db/models.js';
import fs from 'fs';
import path from 'path'
import multer from 'multer';
import { fileURLToPath } from 'url';
import User from '../db/user.js';
import auth from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

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
router.get("/", auth, async (req, res, next) => {
    const user = req.user;
    if(!user){
      res.redirect('/login');
    }
    const items = await imgModel.find({user_id: user.id});

    const baseUrl = `${req.protocol}://${req.get('host')}`;

   
    return res.render('pages/home', { title: 'Etalk', items, url: baseUrl, user });
 
});

router.post("/",auth, upload.single("image"), async function (req, res, next) {
  // const filePath = path.join(__dirname + '/uploads/' +req.file.filename);
  // const base64Img = imgData.toString('base64');
  var obj = {
    name: req.body.name,
    img: {
      data: req.file.filename,
      contentType: 'image/png'
    },
    user_id: req.user.id
  };

  const exist = await imgModel.find({ name: req.body.name, user_id: req.user.id });
  if (exist.length > 0) {
    await imgModel.updateOne({ name: req.body.name, user_id: req.user.id }, obj);
    return res.redirect('/');
  } else {
    const newItem = new imgModel(obj);
    await newItem.save();
    return res.redirect('/');
  }
});

router.get("/screem/:id", async (req, res, next) => {
  const {id} = req.params;
  const user = await User.findOne({_id:id});
console.log(user)
  const items =user? await imgModel.find({user_id: user.id}):await imgModel.find({_id:id});

  return res.render('pages/screem', { title: 'Etalk', items, user });
});

/* GET login page. */
router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

router.post('/login', async(req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Authentication failed. Wrong password.')
      res.redirect('/login')
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true});
    return res.redirect('/')
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error });
  }
});


router.get("/img/:name", async function (req, res) {
  const img = await imgModel.findOne({ name: req.params.name });

  res.status(200).json(img);
});

router.get("/health-check", (req, res) => {
  res.json({ error: false, message: "I'm alive" });
});

router.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register' });
});

/* POST register form. */
router.post('/register', async (req, res) => {
  const {name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    return res.redirect('/login');
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/image/:base64", (req, res) => {
  try {
    const base64String = req.params.base64;

    const imageBuffer = Buffer.from(base64String, "base64");

    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send("Erro ao processar imagem");
  }
});

export default router;
