const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

const usersRoute = require("../routes/users.js");

jest.mock("../db.js", () => jest.fn());
const connectToDb = require("../db.js");

const app = express();
app.use(bodyParser.json());
app.use("/", usersRoute);



describe("POST /register", () => {
  beforeEach(() => {
    connectToDb.mockReset();
  });

  test("Retourne une erreur si les mots de passe ne correspondent pas", async () => {
    const res = await request(app).post("/register").send({
      username: "testuser",
      password: "password123",
      password2: "password456",
    });

    console.log(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Les mots de passe ne correspondent pas.",
    });
  });

  test("Retourne une erreur si les champs sont manquants", async () => {
    const res = await request(app).post("/register").send({
      username: "",
      password: "",
      password2: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Nom d'utilisateur, mot de passe, et confirmation sont requis.",
    });
  });

  test("Créé un utilisateur avec succès", async () => {
    // Mock de la connexion réussie à la base de données
    connectToDb.mockResolvedValue({
      query: jest.fn().mockResolvedValue([{ insertId: 1 }]),
    });

    const res = await request(app).post("/register").send({
      username: "testuser",
      password: "password123",
      password2: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: "Utilisateur créé avec succès",
    });
  });

  test("Retourne une erreur si la base de données est inaccessible", async () => {
    // Mock de la connexion échouée à la base de données
    connectToDb.mockResolvedValue(null);

    const res = await request(app).post("/register").send({
      username: "testuser",
      password: "password123",
      password2: "password123",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: "Erreur de connexion à la base de données",
    });
  });
});
