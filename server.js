// Express stuff
import express from "express";
import session from "express-session";

// Dot my env
import "dotenv/config";

// Location imports
import { fileURLToPath } from "url";
import path from "path";

// Routes
import authRouter from "./routes/auth.js";
import apiRouter from "./routes/api.js";

// Init Express
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set Defaults
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // gives public pages4

// Cookies are delicious
app.use(
    session({
        name: "quasar.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

// Routes used
app.use("/auth", authRouter);
app.use("/api", apiRouter);

// Listen to me
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});