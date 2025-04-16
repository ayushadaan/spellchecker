import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import qualityCheckRoutes from "./routes/qualitycheckRoutes.js";
import imageRoutes from "./routes/altTagRoutes.js";
import ExpressError from "./utils/ExpressError.js";
import { Client } from "@elastic/elasticsearch";
import libre from "libreoffice-convert";
import sharp from "sharp";
import fs from "fs/promises";
import upload from "./utils/multerUtils.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

// Manual promise wrapper for libre.convert
const convertLibre = (input, ext, filter) => {
  return new Promise((resolve, reject) => {
    libre.convert(input, ext, filter, (err, done) => {
      if (err) reject(err);
      else resolve(done);
    });
  });
};

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Root Route
app.get("/", (req, res) => {
  res.render("index", { results: null });
});

const client = new Client({ node: "http://localhost:9200" });

// Convert Document
app.post("/convert-doc", upload.single("file"), async (req, res) => {
  const inputFilePath = req.file.path;
  const outputExt = ".docx";

  try {
    const inputFile = await fs.readFile(inputFilePath);

    const converted = await convertLibre(inputFile, outputExt, undefined);

    const convertedDir = path.join(__dirname, "converted");
    await fs.mkdir(convertedDir, { recursive: true });

    const outputFileName = `${Date.now()}${outputExt}`;
    const outputPath = path.join(convertedDir, outputFileName);

    await fs.writeFile(outputPath, converted);

    res.download(outputPath, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error sending file.");
      }
    });
  } catch (err) {
    console.error("Conversion failed:", err);
    res.status(500).send("Conversion failed.");
  }
});

// Convert Image
app.post("/convert-image", upload.single("image"), async (req, res) => {
  const format = req.body.format;
  const outputName = `${Date.now()}.${format}`;

  const outputDir = path.join(__dirname, "converted");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, outputName);

  try {
    await sharp(req.file.path).toFormat(format).toFile(outputPath);
    res.download(outputPath);
  } catch (err) {
    console.error("Image conversion failed:", err);
    res.status(500).send("Image conversion failed.");
  }
});

// Alt Tag UI
app.get("/alt", (req, res) => {
  res.render("uploadForm", { altTag: req.query.altTag || null });
});

// Convert UI
app.get("/convert", (req, res) => {
  res.render("convert", { results: null });
});

// API Routes
app.use("/api", qualityCheckRoutes);
app.use("/api/images", imageRoutes);

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!", false));
});

// Error Handler
app.use((err, req, res, next) => {
  let {
    status = 500,
    message = "Internal server issue",
    success = false,
  } = err;
  res.status(status).send({ message, success });
});

export default app;
