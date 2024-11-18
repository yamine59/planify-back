const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
require("dotenv").config();
const https = require("https");

router.get("/:city_name", async (req, res) => {
  try {
    const cityName = req.params.city_name;

    const options = {
      method: "GET",
      hostname: process.env.HOST,
      port: null,
      path: `/v1/static/cities?name=${encodeURIComponent(cityName)}&page=0`,
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.HOST,
      },
    };

    const fetchCityData = () => {
      return new Promise((resolve, reject) => {
        const externalReq = https.request(options, (externalRes) => {
          const chunks = [];
          externalRes.on("data", (chunk) => chunks.push(chunk));
          externalRes.on("end", () => {
            try {
              const data = JSON.parse(Buffer.concat(chunks).toString());
              resolve(data);
            } catch (error) {
              reject(new Error("Erreur de parsing JSON"));
            }
          });
        });

        externalReq.on("error", (error) =>
          reject(new Error("Erreur de connexion avec l'API"))
        );
        externalReq.end();
      });
    };

    const cityData = await fetchCityData();

    res.status(200).json(cityData);
  } catch (err) {
    console.error("Erreur lors de la récupération des hôtels :", err);
    res.status(500).send(err);
  }
});

module.exports = router;
