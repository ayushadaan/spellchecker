import express from "express";
import { qualityCheckController } from "../controllers/qualityCheckController.js";

const router = express.Router();

router.post("/check-url", qualityCheckController);

export default router;
