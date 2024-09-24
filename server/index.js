import 'dotenv/config';
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import pgSession from "connect-pg-simple";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import passport from "./authentication/auth.js";

const prisma = new PrismaClient();
const PgSession = pgSession(session);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to handle CSP
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Signup route
app.post('/signup', async (req, res) => {
  const { fullName, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        password: hashedPassword
      }
    });
    req.session.userId = user.id;
    res.status(201).json({ msg: "User created" });
  } catch (error) {
    res.status(400).json({ error: 'Username or email already in use' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  res.status(200).json({ msg: "Login successful" });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Google auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/hello');
  }
);

// Protected route
app.get('/hello', isAuthenticated, (req, res) => {
  res.send('<h1>Hello</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
