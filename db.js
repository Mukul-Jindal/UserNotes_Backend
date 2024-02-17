const mongoose = require('mongoose');

let username = process.env.USERNAME;
let password = process.env.PASSWORD;
const mongoURI = `mongodb+srv://${username}:${password}@usernotes.99f5ncv.mongodb.net/?retryWrites=true&w=majority`;

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