import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Powerpoint, Word } from 'pdf-officegen';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer for file upload
const upload = multer({
  dest: "uploads/",
});

app.use(express.static(path.join(process.cwd(), "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
console.log("Views directory:", path.join(__dirname, "views"));

// POST route to handle file upload and document generation
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Check the file type and generate PowerPoint or Word file accordingly
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  let generatedFile;
  if (fileExtension === '.pptx') {
    // Generate a PowerPoint file
    const ppt = new Powerpoint();
    ppt.createDocument('Title Slide').addText('Generated PowerPoint', { x: 1, y: 1, fontSize: 24 });

    generatedFile = `${__dirname}/uploads/generated_presentation.pptx`;
    ppt.save(generatedFile, (err) => {
      if (err) {
        console.error("Error generating PowerPoint:", err);
        return res.status(500).send("Error generating PowerPoint file.");
      }
      res.download(generatedFile);
    });
  } else if (fileExtension === '.docx') {
    // Generate a Word file
    const word = new Word();
    word.addParagraph('Generated Word Document').addText('This is a generated Word document.', { fontSize: 12 });

    generatedFile = `${__dirname}/uploads/generated_document.docx`;
    word.save(generatedFile, (err) => {
      if (err) {
        console.error("Error generating Word document:", err);
        return res.status(500).send("Error generating Word file.");
      }
      res.download(generatedFile);
    });
  } else {
    res.status(400).send("Invalid file type. Please upload a .pptx or .docx file.");
  }
});

app.get("/", (req, res) => {
  res.render("hello", { results: null });
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
