require("dotenv").config(); // Always at the top
const connectToMongo = require("./Database/db");
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Connect to MongoDB
connectToMongo();

// CORS Configuration (Set this before any routes or middleware)
const corsOptions = {
  origin: process.env.FRONTEND_API_LINK || "*", // e.g. 'https://college-management-system-yani.vercel.app'
  credentials: true,
};

app.use(cors(corsOptions)); // This is enough in most cases

// Optional: CORS Preflight manual handling (Only if needed for edge-case issues)
app.options("*", cors(corsOptions)); // Handles preflight requests globally

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
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server Listening On http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;
