const express = require("express");
const verifyToken = require("../middleware/auth");
const User = require("../models/user");
const Post = require("../models/post");
const router = express.Router();

// @ GET /search
router.get("/", verifyToken, async (req, res) => {
    const query = req.query.search;
    if (!query) return res.redirect("/");
    try {
        const users = await User.find({
            $or: [
                { displayName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        }).select("-password");
        // const posts = await Post.find({
        //     content: { $regex: query, $options: "i" },
        // });
        // const filteredPosts = posts.map((post) => {
        //     const sentences = post.content.split(". "); // Split by sentences (you can modify this based on your content structure)
        //     const matchingSentences = sentences.filter((sentence) =>
        //         sentence.toLowerCase().includes(query.toLowerCase())
        //     );
        //     const summarizedContent = matchingSentences.join(". "); // Join matching sentences
        //     return {
        //         _id: post._id,
        //         summarizedContent: summarizedContent,
        //     };
        // });
        res.render("Search", {
            currentUser: req.session.user,
            pageTitle: "Search",
            currentRoute: "/search",
            query: query,
            result: users,
        });
    } catch (error) {
        console.log("Error at search", error);
        res.render("error", { message: error.message });
    }
});

module.exports = router;
