require("dotenv").config(); // Move this to the top
const connectToMongo = require("./database/db");
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

// Connect to MongoDB
connectToMongo();

// Import routes
const attendanceRoutes = require("./routes/attendance.route");

// Middleware
app.use(
  cors({
    origin:"*", // Add fallback for development
 
  })
);

app.use(express.json()); // to convert request data to json

// Routes
app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

app.use("/media", express.static(path.join(__dirname, "media")));

// API Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));
app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));

// Note: Removed duplicate attendance route registration

// For Vercel, we export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server Listening On http://localhost:${port}`);
  });
}

module.exports = app;