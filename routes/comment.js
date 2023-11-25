const express = require("express");
const verifyToken = require("../middleware/auth");
const Comment = require("../models/comment");
const mongoose = require("mongoose");
const Post = require("../models/post");
const { upload } = require("../middleware/upload");
const deleteCommentAndChild = require("../utils/deleteCommentAndChild");

const router = express.Router();
// router.get("/posts/post/:postId/comments", verifyToken, async (req, res) => {
//     const postId = req.params.postId;
//     if (!mongoose.Types.ObjectId.isValid(postId)) {
//         return res.render("Error", { message: "Invalid post" });
//     }

//     try {
//         const topLevelComments = await Comment.find({
//             postId,
//             parentId: null,
//         }).populate({
//             path: "senderId",
//             select: "-password",
//         });

//         async function populateChildren(comments) {
//             for (const comment of comments) {
//                 const children = await Comment.find({
//                     parentId: comment._id,
//                 }).populate({
//                     path: "senderId",

//                     select: "-password",
//                 });

//                 if (children.length > 0) {
//                     comment.children = children;
//                     await populateChildren(children);
//                 }
//             }
//         }

//         const allCommentsOfPost = await populateChildren(topLevelComments);
//         console.log(allCommentsOfPost);
//     } catch (error) {
//         res.render("error", { message: error.message });
//     }
// });
// POST posts/post/:postId/comments/add
router.post(
    "/posts/post/:postId/comments/add",
    verifyToken,
    upload.array("images", 2),
    async (req, res) => {
        const uploadedFiles = req.files;
        const content = req.body.content;
        const oldNumberOfComments = req.body.numberOfComments;

        const postId = req.params.postId;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.render("Error", { message: "Invalid post" });
        }
        try {
            const multipleFilePromise = uploadedFiles.map((file) =>
                handleUpload(file)
            );
            // await all the cloudinary upload functions in promise.all, exactly where the magic happens
            let imageResponses = await Promise.all(multipleFilePromise);
            const newCommnent = new Comment({
                content: content,
                images: imageResponses,
                senderId: req.userId,
                parentId: null,
                postId: postId,
            });
            await newCommnent.save();
            const newNumberOfComments =
                Number.parseInt(oldNumberOfComments) + 1;
            console.log({ oldNumberOfComments, newNumberOfComments });
            await Post.findByIdAndUpdate(postId, {
                numberOfComments: newNumberOfComments,
            });
            const previousUrl = req.headers.referer || "/";
            res.redirect(previousUrl);
        } catch (error) {
            console.log("Error at add post", error);
            res.render("error", { message: error.message });
        }
    }
);
// POST posts/post/:postId/comments/reply/:commentId

router.post(
    "/posts/post/:postId/comments/reply/:commentId",
    verifyToken,
    upload.array("images", 2),
    async (req, res) => {
        const uploadedFiles = req.files;
        const content = req.body.content;
        const oldNumberOfComments = req.body.numberOfComments;
        const commentId = req.params.commentId;

        const postId = req.params.postId;
        if (
            !mongoose.Types.ObjectId.isValid(postId) ||
            !mongoose.Types.ObjectId.isValid(commentId)
        ) {
            return res.render("Error", { message: "Invalid post" });
        }

        try {
            const multipleFilePromise = uploadedFiles.map((file) =>
                handleUpload(file)
            );
            // await all the cloudinary upload functions in promise.all, exactly where the magic happens
            let imageResponses = await Promise.all(multipleFilePromise);
            const newCommnent = new Comment({
                content: content,
                images: imageResponses,
                senderId: req.userId,
                parentId: commentId,
                postId: postId,
            });
            await newCommnent.save();
            await Post.findByIdAndUpdate(postId, {
                numberOfComments: Number.parseInt(oldNumberOfComments) + 1,
            });
            const previousUrl = req.headers.referer || "/";
            res.redirect(previousUrl);
        } catch (error) {
            console.log("Error at add post", error);
            res.render("error", { message: error.message });
        }
    }
);
// DELETE posts/post/:postId/comments/delete/:commentId
router.get(
    "/posts/post/:postId/comments/delete/:commentId",
    verifyToken,
    async (req, res) => {
        const commentId = req.params.commentId;
        const postId = req.params.postId;
        if (
            !mongoose.Types.ObjectId.isValid(postId) ||
            !mongoose.Types.ObjectId.isValid(commentId)
        ) {
            return res.render("Error", { message: "Invalid post" });
        }

        try {
            // await Comment.findByIdAndDelete(commentId);
            const countDeleted = await deleteCommentAndChild(commentId);
            const currentPost = await Post.findById(postId);

            await Post.findByIdAndUpdate(postId, {
                numberOfComments: currentPost.numberOfComments - countDeleted,
            });
            const previousUrl = req.headers.referer || "/";
            res.redirect(previousUrl);
        } catch (error) {
            console.log("Error at add post", error);
            res.render("error", { message: error.message });
        }
    }
);
module.exports = router;
