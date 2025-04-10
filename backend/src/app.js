import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import qualityCheckRoutes from "./routes/qualitycheckRoutes.js";
import imageRoutes from "./routes/altTagRoutes.js";
import ExpressError from "./utils/ExpressError.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Root Route
app.get("/", (req, res) => {
  res.render("index", { results: null });
});
app.get("/alt", (req, res) => {
  res.render("uploadForm", { altTag: req.query.altTag || null });
});

// API Routes
app.use("/api", qualityCheckRoutes);
app.use("/api/images", imageRoutes);

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!", false));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let {
    status = 500,
    message = "Internal server issue",
    success = false,
  } = err;
  res.status(status).send({ message, success });
});

export default app;
