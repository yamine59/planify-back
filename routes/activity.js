const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
require("dotenv").config();
const connectToDb = require("../db.js");
const jwt = require("jsonwebtoken");



router.post("/creationActivity/:id_travel", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur de connexion à la base de données" }) }

    const travelId = req.params.id_travel;
    const { activity_name, location, activity_date } = req.body;

    if (!activity_name || !location || !activity_date) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const sql = "INSERT INTO activity (activity_name, location, activity_date, id_travel) VALUES (?, ?, ?, ?)";
    const [results] = await db.query(sql, [activity_name, location, activity_date, travelId]);

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

    if (!activity_name || !location || !activity_date) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    const formattedActivity = formatDateTime(activity_date);

    const checkSql = "SELECT * FROM activity WHERE id_travel = ? AND id_activity = ?";
    const [checkResults] = await db.query(checkSql, [travelId, activtyId]);

    if (checkResults.length === 0) {
      return res.status(404).json({ message: "Activite non trouvé" });
    }

    const sql = `UPDATE activity SET activity_name = ?, location = ?, activity_date = ? WHERE id_travel = ? AND id_activity = ?`;
    const [results] = await db.query(sql, [activity_name, location, formattedActivity, travelId, activtyId]);

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


router.get("/showActivity/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur à la base de données" }) }

    const travelId = req.params.id;


    const [results] = await db.query( `SELECT * FROM activity WHERE id_travel = ? ORDER by id_travel desc`, [travelId] );

    res.status(200).json({ message: "listes des activite du user" , listActivity: results});
  } catch (err) {
    console.error("Erreur lors de la récuperation des voyage :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

module.exports = router;
