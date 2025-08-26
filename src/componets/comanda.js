const express = require('express');
const mongoose = require('mongoose');
const app = express()
const cors = require('cors');
const dotenv = require ('dotenv');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');


app.use(cors());
app.use(express.json());
dotenv.config();


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Команда в деле ');
    })
    .catch(err => {
        console.log('Ошибка подключения к MongoDB:', err);
    });


const TeamSchema = new mongoose.Schema({
    img: { type: String  },
    imu: { type: String, required: true },
    famel: { type: String, required: true },
    dolg: { type: String, required: true },
    nomer: { type: String, required: true },
    tg: { type: String, required: true },
    vauder: { type: String, required: true },
 
},{ timestamps: true });

const Team = mongoose.model('Team', TeamSchema);


const UPLOAD_DIR = path.join(__dirname, 'upload');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

const upload = multer({ storage });

app.use('/upload', express.static(UPLOAD_DIR));




app.get('/teamso', async (req, res) => {
  try {
    const products = await Team.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Создать новую запись с файлами
app.post('/comanda',  upload.fields([
  
    { name: 'img', maxCount: 1 },
  ]), async (req, res) => {
  const {  imu, famel, dolg, nomer, tg, vauder } = req.body;

     if (req.files.img?.[0]) {
        imgPath = '/upload/' + req.files.img[0].filename;
      }

  const product = new Team({
    img :imgPath,
    imu,
    famel,
    dolg,
    nomer,
    tg,
    vauder
  });

  const savedProduct = await product.save();
  res.status(201).json(savedProduct);
});




// Удалить запись
app.delete('/tovar/:id', async (req, res) => {
  try {
    const deleted = await Tovar.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Не найдено' });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить запись (без новых файлов)
app.put('/tovar/:id', async (req, res) => {
  
});

module.exports = app;

