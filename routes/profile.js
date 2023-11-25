const express = require("express");
const verifyToken = require("../middleware/auth");
const Post = require("../models/post");
const User = require("../models/user");
const Bookmark = require("../models/bookmark");
const Like = require("../models/like");
const router = express.Router();
const { convertToHTML } = require("../utils/turndowmServices");
const mongoose = require("mongoose");
const { upload } = require("../middleware/upload");
const { handleUpload } = require("../middleware/upload");

const { EditProfileValidation } = require("../middleware/validateReq");
const { validationResult } = require("express-validator");
// @ GET /profile/
router.get("/", verifyToken, async (req, res) => {
    try {
        const postsOfUser = await Post.find({ userId: req.userId })
            .populate("userId", ["displayName", "photoURL"])
            .sort({ createdAt: -1 });
        const bookmarks = await Bookmark.find({ user: req.userId });
        const bookmarkedPostIds = bookmarks.map((bookmark) =>
            bookmark.post.toString()
        );
        const newPosts = postsOfUser.map((post) => ({
            ...post.toObject(),
            content: post.content ? convertToHTML(post.content) : "",
            isBookmarked: bookmarkedPostIds.includes(post._id.toString()),
        }));
        res.render("Profile", {
            pageTitle: `${req.session.user.displayName}`,
            currentRoute: "/profile",
            posts: newPosts,
            postsLength: newPosts.length,
            currentUser: req.session.user,
            user: req.session.user,
            isOwner: true,
        });
    } catch (error) {
        console.log("Error at get Profile", error);
        res.render("error", { message: error.message });
    }
});
// @ GET /profile/user/:userId
router.get("/user/:userId", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.render("Error", { message: "Invalid user" });
    }
    if (userId === req.userId) {
        return res.redirect("/profile");
    }
    try {
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.render("Error", { message: "User not found" });
        }
        const postsOfUser = await Post.find({
            userId: userId,
            status: "PUBLIC",
        })
            .populate("userId", ["displayName", "photoURL"])
            .sort({ createdAt: -1 });

        const bookmarks = await Bookmark.find({ user: userId });
        const bookmarkedPostIds = bookmarks.map((bookmark) =>
            bookmark.post.toString()
        );
        const like = await Like.findOne({ user: req.userId });
        const newPosts = postsOfUser.map((post) => ({
            ...post.toObject(),
            content: post.content ? convertToHTML(post.content) : "",
            isBookmarked: bookmarkedPostIds.includes(post._id.toString()),
            isLiked: like?.posts?.find(
                (pId) => pId.toString() === post._id.toString()
            ),
        }));

        res.render("Profile", {
            pageTitle: `${userProfile.displayName}`,
            currentRoute: `/profile/${userId}`,
            posts: newPosts,
            postsLength: newPosts.length,
            currentUser: req.session.user,
            user: userProfile,
            isOwner: false,
        });
    } catch (error) {
        console.log("Error at get Profile", error);
        res.render("error", { message: error.message });
    }
});

// @ GET /profile/edit/:userId
router.get("/edit/:userId", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.render("Error", { message: "Invalid user" });
        }
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.render("Error", { message: "User not found" });
        }
        res.render("EditProfile", {
            pageTitle: `Edit Profile`,
            currentRoute: `/profile/edit/${userId}`,
            user: userProfile,
            errors: [],
        });
    } catch (error) {
        console.log("Error at get Profile", error);
        res.render("error", { message: error.message });
    }
});

// @ PUT /profile/edit/:userId
router.post(
    "/edit/:userId",
    verifyToken,
    upload.fields([
        { name: "background", maxCount: 1 },
        { name: "avatar", maxCount: 1 },
    ]),
    EditProfileValidation,
    async (req, res) => {
        const userId = req.params.userId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("EditProfile", {
                pageTitle: `Edit Profile`,
                currentRoute: `/profile/edit/${userId}`,

                user: req.session.user,
                errors: errors.array(),
            });
        }
        const { displayName } = req.body;
        const backgroundFile = req.files?.background;
        const avatarFile = req.files?.avatar;

        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.render("Error", { message: "Invalid user" });
            }

            const userProfile = await User.findById(userId);
            if (!userProfile) {
                return res.render("Error", { message: "User not found" });
            }
            let newBackground = userProfile.background;
            let newAvatar = userProfile.avatar;
            if (backgroundFile) {
                newBackground = await handleUpload(backgroundFile[0]);
            }
            if (avatarFile) {
                newAvatar = await handleUpload(avatarFile[0]);
            }
            const newUserProfile = {
                displayName: displayName,
                avatar: newAvatar,
                background: newBackground,
                updatedAt: new Date(),
            };
            await User.findByIdAndUpdate(userId, newUserProfile);

            res.redirect("/profile");
        } catch (error) {
            console.log("Error at get Profile", error);
            res.render("error", { message: error.message });
        }
    }
);

module.exports = router;
