const express = require('express');
const mongoose = require('mongoose');
const app = express()





mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Заявки ');
    })
    .catch(err => {
        console.log('Ошибка подключения к MongoDB:', err);
    });


const ZauvSchema = new mongoose.Schema({
    tel: { type: String ,required: true  },
},{ timestamps: true });

const Zauv = mongoose.model('Zauv', ZauvSchema);


app.post( '/zauvs', async(req ,res) => {
    const {tel} = req.body
    const zauv = new Zauv({tel})
    await zauv.save()
  

})

app.get( '/zauvsi' , async (req,res)=> {

  try{
    const application = await Zauv.find()
    return res.status(200).json(application )

  }catch(error){
    return req.status(400).json({message:'Ошибка'})
  }

})

module.exports = app;
