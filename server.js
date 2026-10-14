// Express stuff
import express from "express";
import session from "express-session";

// Location imports
import { fileURLToPath } from "url";
import path from "path";

// Init Express
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set Defaults
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // gives public pages

// Routes used

// Listen to me
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});