import express from "express";

const router = express.Router();

// Home page route
router.get("/", (req, res) => {
    res.sendFile("")
});