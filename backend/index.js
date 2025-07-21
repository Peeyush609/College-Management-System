require("dotenv").config(); // Always at the top
const connectToMongo = require("./Database/db");
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Connect to MongoDB
connectToMongo();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_API_LINK || "*", // Replace with your frontend URL in production
  credentials: true,
};

app.use(cors(corsOptions));

// Optional: Add CORS headers manually (some Vercel edge functions need this)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_API_LINK || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Body parser
app.use(express.json());

// Static files
app.use("/media", express.static(path.join(__dirname, "media")));

// Routes
app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

app.use("/api/attendance", require("./routes/attendance.route"));
app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));
app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));

// Local development server only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server Listening On http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;
