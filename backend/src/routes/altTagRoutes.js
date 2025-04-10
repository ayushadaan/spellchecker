// routes/imageRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { generateAltTag } from "../controllers/generateAltTagController.js";

// Custom storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Sanitize filename: remove spaces
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = express.Router();

// Route
router.post("/upload", upload.single("image"), generateAltTag);

export default router;
