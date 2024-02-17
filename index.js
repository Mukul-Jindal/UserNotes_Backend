const connectToMongo = require('./db.js');
const express = require('express');
const cors = require('cors');

connectToMongo();
const app = express();
const port = 5000;

//adding Middleware
app.use(cors());
app.use(express.json()); //When sending body to api as json and body is being used in the api code

//Available Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));

app.listen(port, () => {
  console.log(`Backend listening on port http://localhost:${port}`);
});