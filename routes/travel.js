const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
require("dotenv").config();
const connectToDb = require("../db.js");
const jwt = require("jsonwebtoken");



router.post("/creationTravel/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur de connexion à la base de données" }) }

    const userId = req.params.id;
    const { name, destination, persons, start_date, end_date, description, amount } = req.body;

    if (!name || !destination || !start_date || !end_date || !description || !persons || !amount) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const sql = "INSERT INTO travel (name, destination, persons, start_date, end_date, description, amount, id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const [results] = await db.query(sql, [name, destination, persons, start_date, end_date, description, amount, userId]);
  
    res.status(201).json({ message: "Voyage créé" });
  } catch (err) {
    console.error("Erreur lors de la création du voyage :", err);
    res.status(500).send(err);
  }
});



router.put("/modifierTravel/:id_travel", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur de connexion à la base de données" }) }

    const travelId = req.params.id_travel;
    const { name, destination, persons, start_date, end_date, description } = req.body;

    const checkSql = "SELECT * FROM travel WHERE id_travel = ?";
    const [checkResults] = await db.query(checkSql, [travelId]);

    if (checkResults.length === 0) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }

    const sql = `UPDATE travel SET name = ?, destination = ?, persons = ?, start_date = ?, end_date = ?, description = ?
                    WHERE id_travel = ?`;
    const [results] = await db.query(sql, [name, destination, persons, start_date, start_date, description, travelId ]);

    res.status(200).json({ message: "Voyage modifié" });
  } catch (err) {
    console.error("Erreur lors de la création du voyage :", err);
    res.status(500).send(err);
  }
});



router.delete("/supprimerTravel/:id_travel", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur à la base de données" }) }
    
    const travelId = req.params.id_travel;

    const deleteSQL = "DELETE FROM travel WHERE id_travel = ?";
    await db.query(deleteSQL, [travelId]);

    res.status(200).json({ message: "voyage supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du voyage :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});



router.get("/showTravel/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur à la base de données" }) }

    const userId = req.params.id;


    const [results] = await db.query( `SELECT * FROM travel WHERE id_user = ? ORDER by id_travel desc`, [userId] );

    res.status(200).json({ message: "listes des voyages du user" , listtravel: results});
  } catch (err) {
    console.error("Erreur lors de la récuperation des voyage :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

router.get("/showTheTravel/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) { return res.status(500).json({ message: "Erreur à la base de données" }) }

    const userId = req.params.id;


    const [results] = await db.query( `SELECT * FROM travel WHERE id_travel = ? `, [userId] );

    res.status(200).json({ message: "listes des voyages du user" , listtravel: results});
  } catch (err) {
    console.error("Erreur lors de la récuperation des voyage :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

module.exports = router;
