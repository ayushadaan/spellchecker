// controllers/imageController.js
import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Initialize Google Vision client
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
  process.cwd(),
  "./src/config",
  "first-inquiry-455012-e3-1102d04d6332.json"
);

// console.log(
//   `Google Application Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

const client = new ImageAnnotatorClient();

export const generateAltTag = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = req.file.path;
  console.log(`File uploaded at: ${filePath}`);

  try {
    const [result] = await client.labelDetection(filePath);
    const labels = result.labelAnnotations;

    if (labels && labels.length > 0) {
      const altTag = labels.map((label) => label.description).join(", ");
      return res.json({ altTag });
    } else {
      return res.status(404).send("No labels found in the image.");
    }
  } catch (err) {
    console.error("Error during Vision API call:", err);
    return res.status(500).send("Error processing image.");
  } finally {
    try {
      // await fs.unlink(filePath); // Clean up
      console.log("Uploaded image file deleted.");
    } catch (err) {
      console.error("Error deleting uploaded file:", err);
    }
  }
};
