import express from "express";
import { qualityCheckController } from "../controllers/qualitycheckController.js";

const router = express.Router();

router.post("/check-url", qualityCheckController);

export default router;
