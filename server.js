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
app.use('/api/planify/users', users);

const travel = require('./routes/travel.js')
app.use('/api/planify/travel', travel);

const activity = require('./routes/activity.js')
app.use('/api/planify/activity', activity);

const hotel = require('./api/hotel.js')
app.use('/api/planify/hotel', hotel);

const city = require('./api/city.js')
app.use('/api/planify/city', city);



const PORT = process.env.PORT || 3003; // Définit un port par défaut si non défini dans .env
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});