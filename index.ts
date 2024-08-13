import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import crypto from "crypto";
import session from "express-session";
import passport from "./auth/auth"; // Import the passport configuration

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

const generateSessionToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// Simple in-memory user store
const users: { [key: string]: string } = {
  user1: "password1"
};

// Login route 
app.post("/login", (request, response) => {
  console.log("Request body: ", request.body);
  const { username, password } = request.body;
  if (users[username] && users[username] === password) {
    const sessionToken = generateSessionToken();
    response.cookie("session", sessionToken, { httpOnly: true, secure: true, sameSite: "strict" });
    response.status(200).send("Login successful");
  } else {
    response.status(401).send("Invalid credentials");
  }
});

// Google OAuth routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (request, response) => {
    // Successful authentication, redirect home.
    response.redirect("/");
  }
);

// Middleware to check login
const checkLogin = (request: Request, response: Response, next: NextFunction) => {
  if (request.isAuthenticated()) {
    return next();
  } else {
    response.status(401).send("Unauthorized");
  }
};

// Protected route
app.get("/protected", checkLogin, (request, response) => {
  response.status(200).send("This is a protected route");
});

app.get("/", (request, response) => { 
  response.status(200).send("Hello World");
}); 

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});