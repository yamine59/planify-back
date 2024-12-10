const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const connectToDb = require('./db.js');
require('dotenv').config();
const cors = require('cors');



const app = express();
app.use(bodyParser.json());

app.use(cors({
}));


connectToDb();

const users = require('./routes/users.js')
app.use('/users', users);

const travel = require('./routes/travel.js')
app.use('/travel', travel);

const activity = require('./routes/activity.js')
app.use('/activity', activity);

const hotel = require('./api/hotel.js')
app.use('/hotel', hotel);

const city = require('./api/city.js')
app.use('/city', city);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})