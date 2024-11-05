const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const connectToDb = require('./db.js');
require('dotenv').config();
const cors = require('cors');



const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000',
}));


connectToDb();

const users = require('./routes/users.js')
app.use('/users', users);

const travel = require('./routes/travel.js')
app.use('/travel', travel);

const activity = require('./routes/activity.js')
app.use('/activity', activity);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})