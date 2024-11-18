const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersRoute = require("../routes/users.js");

jest.mock("../db.js", () => jest.fn());
const connectToDb = require("../db.js");

const app = express();
app.use(bodyParser.json());
app.use("/", usersRoute);

describe("POST /login", () => {
  beforeEach(() => {
    connectToDb.mockReset();
  });

  // Simuler les variables d'environnement pour JWT
  beforeAll(() => {
    process.env.JWT_SECRET = "testsecret";
    process.env.JWT_EXPIRES_IN = "1h";
  });



  test("Retourne une erreur si les champs sont manquants", async () => {
    const res = await request(app).post("/login").send({
      username: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Nom d'utilisateur et mot de passe sont requis.",
    });
  });



  test("Retourne une erreur si l'utilisateur n'existe pas", async () => {
    connectToDb.mockResolvedValue({
      query: jest.fn().mockResolvedValue([[]]), // Aucun utilisateur trouvé
    });

    const res = await request(app).post("/login").send({
      username: "inconnu",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Nom d'utilisateur ou mot de passe incorrect",
    });
  });



  test("Retourne une erreur si le mot de passe est incorrect", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    connectToDb.mockResolvedValue({
        query: jest
            .fn()
            .mockResolvedValue([[{ 
                id: 1, username: "testuser", password: hashedPassword 
            }]]), 
    });

    const res = await request(app).post("/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Nom d'utilisateur ou mot de passe incorrect",
    });
  });



  test("Connecté avec succès", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    connectToDb.mockResolvedValue({
        query: jest
            .fn()
            .mockResolvedValue([[{ 
                id: 1, username: "testuser", password: hashedPassword 
            }]]), 
    });

    const res = await request(app).post("/login").send({
        username: "testuser",
        password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toBe("Utilisateur connecté");
});




  test("Retourne une erreur si la base de données est inaccessible", async () => {
    connectToDb.mockResolvedValue(null); // Connexion échouée

    const res = await request(app).post("/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: "Erreur de connexion à la base de données",
    });
  });
});
