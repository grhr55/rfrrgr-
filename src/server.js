const express = require('express');
const mongoose = require('mongoose');
const tovar = require('./componets/tovar');
const comanda  = require('./componets/comanda');
const  zauv  = require('./componets/applications');



const dotenv = require ('dotenv');




const app = express();
const port = 5700;

const cors = require('cors');
app.use(cors());
dotenv.config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Главный маршрутизатор сервер успешно подключен');
    })
    .catch(err => {
        console.log('Ошибка подключения к MongoDB:', err);
    });

// Настройка парсинга JSON и данных формы
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));


// Монтирование маршрутов
app.use('/avto', tovar);
app.use('/team', comanda);
app.use('/applications', zauv );






// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на порту ${port}`);
});
