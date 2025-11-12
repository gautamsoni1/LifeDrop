const mongoose = require('mongoose');
const colors = require('colors');
const connectDB = async () =>{
    try{
         await mongoose.connect(process.env.MONGO_URI)
         console.log(`Connected To Mongodb Database ${mongoose.connection.host}`.bgCyan.white);
    } catch (error) {
            console.log(`MongoDB database Error ${error}`.bgRed.white)
    }
};

module.exports = connectDB