const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;

// parse options
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// routes
const blogRoutes = require("./src/routers/blog.route");
const commentRoutes = require("./src/routers/comment.route");
const userRoutes = require("./src/routers/auth.user.route");

app.use("/api/auth", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/blogs", blogRoutes);

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);

  app.get("/", (req, res) => {
    res.send("Travel Experience Server is running...!");
  });
}

main()
  .then(() => console.log("Mongodb connected successfully!"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
