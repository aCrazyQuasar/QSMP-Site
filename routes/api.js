import { Router } from "express";
import { requireLogin } from "../middleware/requireLogin.js";

const router = Router();

router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            user: null
        });
    }

    res.json({
        success: true,
        user: req.session.user
    });
});

export default router;