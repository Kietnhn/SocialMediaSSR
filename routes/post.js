const express = require("express");
const router = express.Router();
const {
    convertToHTML,
    convertToMarkdown,
} = require("../utils/turndowmServices");
const { upload } = require("../middleware/upload");
const Like = require("../models/like");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Bookmark = require("../models/bookmark");

const { handleUpload, destroyImages } = require("../middleware/upload");
const mongoose = require("mongoose");
const verifyToken = require("../middleware/auth");
const { addPostValidation } = require("../middleware/validateReq");
const { validationResult } = require("express-validator");
const { isHtmlClean } = require("../utils/sanitizeHtml");
const { extractBodyContent } = require("../utils/extractHtml");
const getAllCommentsForPost = require("../utils/populateChildrenComment");
const getFromNow = require("../utils/getFromNow");
router.get("/", verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({
            $or: [{ status: "PUBLIC" }, { userId: req.userId }],
        })
            .populate("userId", ["displayName", "avatar"])
            .sort({ createdAt: -1 })
            .limit(10);
        const bookmarks = await Bookmark.find({ user: req.userId });
        const like = await Like.findOne({ user: req.userId });

        const bookmarkedPostIds = bookmarks.map((bookmark) =>
            bookmark.post.toString()
        );

        const newPosts = posts.map((post) => ({
            ...post.toObject(),
            content: post.content ? convertToHTML(post.content) : "",
            isBookmarked: bookmarkedPostIds.includes(post._id.toString()),
            isLiked: like?.posts?.find(
                (pId) => pId.toString() === post._id.toString()
            ),
            fromNow: getFromNow(post.createdAt),
        }));
        res.render("Home.ejs", {
            posts: newPosts,
            currentUser: req.session.user,
            pageTitle: "Home",
            currentRoute: "/",
        });
    } catch (error) {
        console.log("Error at get posts", error);
        res.render("error", { message: error.message });
    }
});
// GET api/posts/post/:postId
router.get("/posts/post/:postId", verifyToken, async (req, res) => {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.render("Error", { message: "Invalid post" });
    }
    try {
        const post = await Post.findById(postId).populate("userId", [
            "displayName",
            "avatar",
        ]);
        if (!post) {
            res.render("Error", { message: "Post not found" });
        }
        const like = await Like.findOne({ user: req.userId, posts: postId });
        const bookmark = await Bookmark.findOne({
            user: req.userId,
            post: postId,
        });
        post.content = post.content ? convertToHTML(post.content) : "";
        post.isLiked = !!like;
        post.isBookmarked = !!bookmark;
        post.fromNow = getFromNow(post.createdAt);
        const allCommentsOfPost = await getAllCommentsForPost(
            postId,
            req.userId
        );

        res.render("SinglePost", {
            post: post,
            pageTitle: "Single post",
            currentUser: req.session.user,
            comments: allCommentsOfPost,
            currentRoute: `/posts/post/${postId}`,
            errorMessage: "",
        });
    } catch (error) {
        console.log("Error at get single post", error);
    }
});
router.get("/posts/edit/:postId", verifyToken, async (req, res) => {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.render("Error", { message: "Invalid post" });
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            res.render("Error", { message: "Post not found" });
        }
        post.content = post.content ? convertToHTML(post.content) : "";
        res.render("EditPost", {
            post: {
                _id: post._id,
                userId: post.userId,
                images: post.images,
                createdAt: post.createdAt,
                parentId: post.parentId,
                updatedAt: post.updatedAt,
            },
            postContent: post.content,
            pageTitle: "Edit post",
            currentRoute: `/posts/post/${postId}`,
            errorMessage: "",
        });
    } catch (error) {
        console.log("Error at get edit post", error);
    }
});
// DELETE api/posts/delete/:postId

router.get("/posts/delete/:postId", verifyToken, async (req, res) => {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.render("Error", { message: "Invalid post" });
    }
    try {
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.render("Error", { message: "Post not found" });
        }
        if (post.images.length > 0) {
            const imageIds = post.images.map((image) => image.id);
            await destroyImages(imageIds);
        }
        res.redirect("/");
    } catch (error) {
        console.log("Error at delete  post", error);
    }
});

router.get("/posts/add", verifyToken, async (req, res) => {
    try {
        res.render("CreatePost.ejs", {
            pageTitle: "New Post",
            currentRoute: "/posts/add",
            currentUser: req.session.user,
            errorMessage: "",
            content: "",
        });
    } catch (error) {
        console.log("Error at get add post", error);
    }
});
// like a post
// POST api/posts/post/:postId/like
router.post("/posts/post/:postId/like", verifyToken, async (req, res) => {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.render("Error", { message: "Invalid post" });
    }
    const oldNumberOfLikes = req.body.numberOfLikes;
    try {
        const like = await Like.findOne({ user: req.userId });
        // user is not like any post
        let newNumberOfLikes = Number.parseInt(oldNumberOfLikes);
        if (!like) {
            const newLike = new Like({
                user: req.userId,
                posts: [postId],
            });

            await newLike.save();
            newNumberOfLikes += 1;
        } else {
            // user like some posts
            const isLiked = like.posts.find((pId) => pId.toString() === postId);
            // is user liked this post
            if (isLiked) {
                await Like.findByIdAndUpdate(like._id, {
                    posts: like.posts.filter(
                        (pId) => pId.toString() !== postId
                    ),
                });
                newNumberOfLikes -= 1;
            } else {
                await Like.findByIdAndUpdate(like._id, {
                    posts: [...like.posts, postId],
                });
                newNumberOfLikes += 1;
            }
        }
        await Post.findByIdAndUpdate(postId, {
            numberOfLikes: newNumberOfLikes,
        });
        const previousUrl = req.headers.referer || "/";
        res.redirect(previousUrl);
        // res.redirect(req.baseUrl);
    } catch (error) {
        res.render("error", { message: error.message });
    }
});
router.post(
    "/posts/add/html",
    verifyToken,
    upload.single("htmlFile"),
    async (req, res) => {
        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.render("EmbedHTMLFile.ejs", {
                pageTitle: "New Post with HTML File",
                currentRoute: "/posts/add/html",
                errorMessage: "No file uploaded",
            });
        }
        const htmlContent = uploadedFile.buffer.toString();
        const bodyContent = extractBodyContent(htmlContent);
        const { sanitizedHtml, isClean } = isHtmlClean(bodyContent);
        try {
            res.render("CreatePost.ejs", {
                pageTitle: "New Post",
                currentRoute: "/posts/add",
                errorMessage: "",
                content: sanitizedHtml,
            });
        } catch (error) {
            console.log("Error at get add post", error);
        }
    }
);
router.get("/posts/add/html", verifyToken, async (req, res) => {
    try {
        res.render("EmbedHTMLFile.ejs", {
            pageTitle: "New Post with HTML File",
            currentRoute: "/posts/add/html",
            errorMessage: "",
        });
    } catch (error) {
        console.log("Error at get add post", error);
    }
});

// POST /posts/add
router.post(
    "/posts/add",
    verifyToken,
    upload.array("images", 4),
    addPostValidation,
    async (req, res) => {
        const uploadedFiles = req.files;

        const content = req.body.content;
        const status = req.body.status;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("CreatePost.ejs", {
                pageTitle: "New Post",
                content: "",
                currentRoute: "/posts/add",
                errorMessage: errors.array()[0].msg,
            });
        }

        try {
            const multipleFilePromise = uploadedFiles.map((file) =>
                handleUpload(file)
            );
            // await all the cloudinary upload functions in promise.all, exactly where the magic happens
            let imageResponses = await Promise.all(multipleFilePromise);
            const markdown = convertToMarkdown(content);
            const newPost = new Post({
                content: markdown,
                images: imageResponses,
                userId: req.userId,
                numberOfLikes: 0,
                numberOfComments: 0,
                status: status ? status : "PUBLIC",
            });
            await newPost.save();
            res.redirect("/");
        } catch (error) {
            console.log("Error at add post", error);
            res.render("error", { message: error.message });
        }
    }
);

// PUT /posts/:postId
router.post(
    "/posts/edit/:postId",
    verifyToken,

    upload.array("images", 4),
    addPostValidation,
    async (req, res) => {
        const uploadedFiles = req.files;

        const content = req.body.content;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("EditPost.ejs", {
                pageTitle: "New Post",
                currentRoute: "/posts/add",
                errorMessage: errors.array()[0].msg,
            });
        }
        const postId = req.params.postId;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.render("Error", { message: "Invalid post" });
        }
        try {
            let imageResponses = [];
            // user uploaded new files so delete old cloud images
            const oldPost = await Post.findById(postId);
            if (uploadedFiles.length > 0) {
                const oldImages = oldPost.images.map((image) => image.id);
                if (oldImages.length > 0) {
                    await destroyImages(oldImages);
                }
                const multipleFilePromise = uploadedFiles.map((file) =>
                    handleUpload(file)
                );
                imageResponses = await Promise.all(multipleFilePromise);
            } else {
                // user keep old cloud images
                imageResponses = oldPost.images;
            }
            const markdown = convertToMarkdown(content);
            await Post.findByIdAndUpdate(postId, {
                content: markdown,
                images: imageResponses,
                updatedAt: new Date(),
            });
            res.redirect("/");
        } catch (error) {
            console.log("Error at edit post", error);
            res.render("error", { message: error.message });
        }
    }
);

module.exports = router;
