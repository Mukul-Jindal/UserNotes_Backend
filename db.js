const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.DATABASE_URL;

const connectToMongo = async () => {
    mongoose.connect(mongoURI, {
        dbName: "iNoteBook",
    }).then((e) => {
        console.log("Connection Established");
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = connectToMongo;