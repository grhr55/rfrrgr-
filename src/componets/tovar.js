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
        console.log('Базаданых магазин успешно подключено');
    })
    .catch(err => {
        console.log('Ошибка подключения к MongoDB:', err);
    });

const TovarSchema = new mongoose.Schema({
    img: { type: String },
    marc: { type: String, required: true },
    probeg: { type: String, required: true },
    dviga: { type: String, required: true },
    mouy: { type: String, required: true },
    cor: { type: String, required: true },
    print: { type: String, required: true },
    printavt: { type: String, required: true },
    video: { type: String},
    vid: { type: String},
    avoriarin: { type: String, required: true },
  
},{ timestamps: true });

const Tovar = mongoose.model('Tovar', TovarSchema);



const UPLOAD_DIR = path.join(__dirname, 'uploads');

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

app.use('/uploads', express.static(UPLOAD_DIR));


// Получить все записи
app.get('/darc', async (req, res) => {
  try {
    const products = await Tovar.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Создать новую запись с файлами
app.post('/tovar',
  upload.fields([{ name: 'img', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { marc, probeg, dviga, mouy, cor, print, printavt, avoriarin, video, vid } = req.body;

      // Проверяем, что хотя бы одна ссылка есть
      if (!video && !vid) {
        return res.status(400).json({ error: 'ссылка обязательна' });
      }

      // Регулярка
      const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/;

      // Берем приоритетно `vid`, если есть, иначе `video`
      const linkToNormalize = vid || video;

      const match = linkToNormalize.match(regex);

      const normalized = match
        ? `https://fourfeef.onrender.com/watch?v=${match[1]}`
        : linkToNormalize;

      // Обработка файла
      let imgPath = null;
      if (req.files.img?.[0]) {
        imgPath = '/uploads/' + req.files.img[0].filename;
      }

      // Сохраняем в БД
      const product = new Tovar({
        img: imgPath,
        marc,
        probeg,
        dviga,
        mouy,
        cor,
        print,
        printavt,
        avoriarin,
        video :normalized, 
        vid :normalized,
      });

      const saved = await product.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

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
  try {
    const updated = await Tovar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Не найдено' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = app;

