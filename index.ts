import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;
const prisma = new PrismaClient();

// --- Middleware Setup ---
app.use(cors()); // Allows all cross-origin requests
app.use(bodyParser.json());

// --- API Routes ---

// SIGN UP ROUTE
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user. Email may be in use.' });
  }
});

// LOGIN ROUTE
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});