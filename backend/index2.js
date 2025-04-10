import express from "express";
import cookieParser from "cookie-parser";

const app = express();
const port = 8080;
app.use(cookieParser());

app.get("/", (req, res) => {
  res.cookie("name", "ayush kumar");
  console.log('Cookies: ', req.cookies)


  res.send("hello world");
});

app.listen(port, () => {
  console.log(`App is listing on port ${port}`);
});
