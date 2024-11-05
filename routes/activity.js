const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
require("dotenv").config();
const connectToDb = require("../db.js");
const jwt = require("jsonwebtoken");



function formatDateTime(dateTime) {
  if (!dateTime) return null;

  const parts = dateTime.split(" ");
  if (parts.length !== 2) return null;

  const dateParts = parts[0].split("/");
  const timeParts = parts[1].split(":");

  if (dateParts.length === 3 && timeParts.length === 2) {
    const [day, month, year] = dateParts;
    const [hours, minutes] = timeParts;
    return `${year}-${month}-${day} ${hours}:${minutes}:00`; // Format: YYYY-MM-DD HH:mm:ss
  }
  return null;
}

router.post("/creationActivity/:id_travel", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur de connexion à la base de données" }) }

    const travelId = req.params.id_travel;
    const { activity_name, location, activity_date } = req.body;

    if (!activity_name || !location || !activity_date ) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const formattedActivity = formatDateTime(activity_date);

    const sql = "INSERT INTO activity (activity_name, location, activity_date, id_travel) VALUES (?, ?, ?, ?)";
    const [results] = await db.query(sql, [ activity_name, location, formattedActivity, travelId ]);

    res.status(201).json({ message: "Activite créé" });
  } catch (err) {
    console.error("Erreur lors de la création de l'activite :", err);
    res.status(500).send(err);
  }
});



router.put("/modifierActivity/:id_travel/:id_activity", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur de connexion à la base de données" }) }

    const travelId = req.params.id_travel;
    const activtyId = req.params.id_activity;
    const { activity_name, location, activity_date } = req.body;

    if (!activity_name || !location || !activity_date ) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    const formattedActivity = formatDateTime(activity_date);

    const checkSql = "SELECT * FROM activity WHERE id_travel = ? AND id_activity = ?";
    const [checkResults] = await db.query(checkSql, [travelId, activtyId]);

    if (checkResults.length === 0) {
      return res.status(404).json({ message: "Activite non trouvé" });
    }

    const sql = `UPDATE activity SET activity_name = ?, location = ?, activity_date = ? WHERE id_travel = ? AND id_activity = ?`;
    const [results] = await db.query(sql, [activity_name, location, formattedActivity, travelId, activtyId ]);

    res.status(200).json({ message: "Activite modifié" });
  } catch (err) {
    console.error("Erreur lors de la création du Activite :", err);
    res.status(500).send(err);
  }
});



router.delete("/supprimerActivity/:id_travel/:id_activity", async (req, res) => {
    try {
      const db = await connectToDb();
      if (!db) { return res.status(500).json({ message: "Erreur à la base de données" }) }
  
      const travelId = req.params.id_travel;
      const activtyId = req.params.id_activity;
  
      const deleteSQL = "DELETE FROM activity WHERE id_travel = ? AND id_activity = ?";
      await db.query(deleteSQL, [travelId, activtyId]);
  
      res.status(200).json({ message: "Activite supprimé avec succès" });
    } catch (err) {
      console.error("Erreur lors de la suppression du Activite :", err);
      res.status(500).json({ message: "Erreur serveur", error: err });
    }
  });


  
module.exports = router;
