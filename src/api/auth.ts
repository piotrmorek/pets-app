import { NextFunction, Request, Response, Router } from "express";
import crypto from 'crypto';
import pool from "../db";

type LoginRequestBody = {
    email: string;
    password: string;
};

export const authRouter = Router();

const generateSessionToken = (): string => {
    return crypto.randomBytes(64).toString('hex');
  };

authRouter.post("/login", (request: Request<LoginRequestBody>, response) => {
    const { email, password } = request.body;

    pool.query(`SELECT * FROM users WHERE email = $1 AND password = $2`, [email, password], (error, result) => {
        console.log(result);
        if (error) {
            return response.status(500).json({ error: "An error occurred" });
        }

        if (result.rows.length === 0) {
            return response.status(401).json({ error: "Invalid user email or password" });
        }

        const sessionToken = generateSessionToken();
        response.cookie("session", sessionToken, { httpOnly: true });
        return response.sendStatus(204);
    });
});

authRouter.get("/logout", (request, response) => {
  response.clearCookie("session");
  response.status(204).send("Logout successful");
});

authRouter.post("/register", (request, response) => {
    const { email, password } = request.body;

    pool.query(`INSERT INTO users (email, password) VALUES ($1, $2)`, [email, password], (error) => {
        console.log(error); 
        if (error) {
            return response.status(500).json({ error: "An error occurred" });
        }

        return response.sendStatus(201);
    });
});