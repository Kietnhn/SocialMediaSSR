require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PostRoutes = require("./routes/post");
const UserRoutes = require("./routes/user");
const BookmarkRoutes = require("./routes/bookmark");
const ProfileRoutes = require("./routes/profile");
const SearchRoutes = require("./routes/search");
const CommentRoutes = require("./routes/comment");
const SettingRoutes = require("./routes/setting");

// MongoDB connection
const connectDB = async () => {
    try {
        mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.x93oxr3.mongodb.net/${process.env.DB_NAME}`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
};
connectDB();

// Set the view engine to EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

// Serve static files
// app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/uploads"));
// Serve uploaded files with corrected paths

// Routes
app.use("/", PostRoutes);
app.use("/", CommentRoutes);
app.use("/user", UserRoutes);
app.use("/search", SearchRoutes);
app.use("/profile", ProfileRoutes);
app.use("/bookmark", BookmarkRoutes);
app.use("/setting", SettingRoutes);
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
