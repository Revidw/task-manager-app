import express from "express";
import helmet from "helmet";
import cors from "cors";
import bcrypt from "bcryptjs";
import db from "./config/db.js";
import generateToken from './utils/generateToken.js';
import env from 'dotenv';
import { protect } from "./middleware/protect.js";

env.config()

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));


app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });


        }


        const normalizedEmail = email.trim().toLowerCase();
        const result = await db.query("SELECT * FROM users WHERE email=$1", [normalizedEmail]);



        if (result.rowCount > 0) {
            return res.status(400).json({ message: "User already exists." });

        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertResult = await db.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, name, email;", [name, normalizedEmail, hashedPassword])
        const user = insertResult.rows[0]

        res.status(201).json({
            id: user.id,
            name: name,
            email: normalizedEmail,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error." });
    }
})


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userResult = await db.query("SELECT id, name, email, password_hash FROM users WHERE email=$1", [normalizedEmail])
        const user = userResult.rows[0]

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
})

app.put("/update", protect, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("UPDATE users SET name=$1, email=$2, password_hash=$3 WHERE id=$4", [name, normalizedEmail, hashedPassword, req.user.id])

        return res.json({
            id: req.user.id,
            name: name,
            email: email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
})

app.post("/tasks", protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Task title is required." })

        }
        const result = await db.query("INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *", [title, description || "", req.user.id]);
        res.status(201).json(result.rows[0])
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });

    }
});

app.get("/tasks", protect, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM tasks WHERE user_id=$1 ORDER BY id ASC", [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/tasks/:id", protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;
        const result = await db.query("SELECT id FROM tasks WHERE id=$1", [id])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task can't be found." });
        }
        if (result.rowCount > 0) {
            if (!title) {
                return res.status(400).json({ message: "Title is required!" })
            }
            const insertResult = await db.query("UPDATE tasks SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
                [title, description || "", id, req.user.id])
            res.status(200).json(insertResult.rows[0])
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

app.delete("/tasks/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task can't be found" });
        }

        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error." });
    }
});

app.get("/profile", protect, (req, res) => {
    res.json({ user: req.user });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});