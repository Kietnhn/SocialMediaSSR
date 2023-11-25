const express = require("express");
const verifyToken = require("../middleware/auth");
const mongoose = require("mongoose");
const Bookmark = require("../models/bookmark");
const router = express.Router();
const { convertToHTML } = require("../utils/turndowmServices");

const { extractTextFromHTML } = require("../utils/extractHtml");
// @ GET /bookmark
router.get("/", verifyToken, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.userId })
            .populate("post")
            .populate("user", ["displayName", "avatar"]);
        const newBookmarks = bookmarks.map((bookmark) => {
            if (!bookmark.post || !bookmark.user)
                return {
                    ...bookmark.toObject(),
                    post: {
                        content: `This post no longer exists.`,
                        images: [],
                    },
                    user: {
                        displayName: "Unknown",
                        avatar: null,
                    },
                };
            const textContent = bookmark.post.content
                ? extractTextFromHTML(convertToHTML(bookmark.post.content))
                : "";
            return {
                ...bookmark.toObject(),
                post: {
                    ...bookmark.post.toObject(),
                    content: textContent,
                },
            };
        });
        res.render("Bookmark", {
            bookmarks: newBookmarks,
            currentRoute: "/bookmark",
            currentUser: req.session.user,
            pageTitle: "Bookmarks",
        });
    } catch (error) {
        console.log("Error at get bookmark", error);
    }
});

// @ POST /bookmark/add/:postId
router.post("/add/:postId", verifyToken, async (req, res) => {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.render("Error", { message: "Invalid post" });
    }
    try {
        const bookmark = new Bookmark({
            user: req.userId,
            post: postId,
        });
        await bookmark.save();
        res.redirect("/");
    } catch (error) {
        console.log("Error at add bookmark", error);
    }
});

// @ DELETE /bookmark/delete/:postId
router.get("/delete/:bookmarkId", verifyToken, async (req, res) => {
    const bookmarkId = req.params.bookmarkId;
    if (!mongoose.Types.ObjectId.isValid(bookmarkId)) {
        return res.render("Error", { message: "Invalid bookmark" });
    }
    try {
        await Bookmark.findByIdAndDelete(bookmarkId);
        res.redirect(req.baseUrl);
    } catch (error) {
        console.log("Error at delete bookmark", error);
    }
});

module.exports = router;
