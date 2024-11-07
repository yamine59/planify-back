const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
require("dotenv").config();
const https = require('https');



router.get("/hotel/:id_city", async (req, res) => {
  try {
    const cityId = req.params.id_city;

    const options = {
        method: 'GET',
        hostname: process.env.HOST,
        port: null,
        path: `/v1/static/hotels?page=0&city_id=${cityId}`,
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.HOST
        }
    };

    const fetchHotel = () => {
        return new Promise((resolve, reject) => {
            const externalReq = https.request(options, (externalRes) => {
                const chunks = [];
                externalRes.on('data', (chunk) => chunks.push(chunk));
                externalRes.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
            });

            externalReq.on('error', (error) => reject(new Error('Erreur lors de la communication avec l\'API externe')));
            externalReq.end();
        });
    }

    const resHotel = await fetchHotel();
    

    res.status(200).json(resHotel);
  } catch (err) {
    console.error("Erreur lors de la récupération des hôtels :", err);
    res.status(500).send(err);
  }
});


  
module.exports = router;