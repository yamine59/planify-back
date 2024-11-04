const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
require("dotenv").config();
const connectToDb = require("../db.js");
const jwt = require("jsonwebtoken");



router.post("/register", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) {
      return res.status(500).json({ message: "Erreur de connexion à la base de données" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Nom d'utilisateur et mot de passe sont requis." });
    }  

    // Vérification si le username est déjà utilisé
    const usernameCheck = "SELECT * FROM users WHERE username = ?";
    const [usernameCheckResult] = await db.query(usernameCheck, [username]);
    if (usernameCheckResult.length > 0) {
      return res.status(400).json({ message: "Cet username est déjà utilisé." });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const [results] = await db.query(sql, [ username, hashedpassword ]);
    
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    res.status(500).send(err);
  }
});



router.post("/login", async (req, res) => {
    try {
      const db = await connectToDb();
      if (!db) { 
        return res.status(500).json({ message: "Erreur de connexion à la base de données" });
      }
  
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Nom d'utilisateur et mot de passe sont requis." });
      }  
      
      const sql = "SELECT * FROM users WHERE username = ?";
      const [results] = await db.query(sql, [username]);
      
      if (results.length === 0) { 
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }
  
      const token = jwt.sign(
        { id_user: user.id_user, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      res.status(200).json({ message: "Utilisateur connecté", token: token });
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      res.status(500).json({ message: 'Erreur lors de la connexion.', error: err.message });
    }
  });
  



router.get("/profile/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) {
      return res.status(500).json({ message: "Erreur à la base de données" });
    }

    const userId = parseInt(req.params.id);

    const [results] = await db.query( `SELECT username FROM users WHERE id = ?`, [userId] );
    if (results.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé !" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).send(err);
  }
});



router.put("/modifierProfile/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) {
      return res.status(500).json({ message: "Erreur de connexion à la base de données" });
    }

    const userId = req.params.id;
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username et password sont requis.' });
    }

    // Vérification si le username est déjà utilisé par un autre utilisateur
    const usernameCheck = "SELECT * FROM users WHERE username = ? AND id != ?";
    const [usernameCheckResult] = await db.query(usernameCheck, [ username, userId ]);
    if (usernameCheckResult.length > 0) {
      return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "UPDATE users SET username = ?, password = ? WHERE id = ?";
    await db.query(sql, [username, hashedPassword, userId]);

    res.status(200).json({ message: "Profil mis à jour avec succès !" });
  } catch (err) {
    res.status(500).json("Erreur lors de la mise à jour du profil :", err);
  }
});



router.delete("/supprimerProfile/:id", async (req, res) => {
  try {
    const db = await connectToDb();
    if (!db) {
      return res.status(500).json({ message: "Erreur à la base de données" });
    }

    const userId = parseInt(req.params.id);

    const deleteSQL = "DELETE FROM users WHERE id = ?";
    await db.query(deleteSQL, [userId]);

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du compte :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});



module.exports = router;
