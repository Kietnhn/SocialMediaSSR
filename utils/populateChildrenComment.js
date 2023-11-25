const Comment = require("../models/comment");
const getFromNow = require("./getFromNow");
module.exports = async function getAllCommentsForPost(postId, userId) {
    try {
        const topLevelComments = await Comment.find({
            postId,
            parentId: null,
        }).populate("senderId", "displayName avatar");

        async function populateChildren(comments) {
            for (const comment of comments) {
                const children = await Comment.find({
                    parentId: comment._id,
                }).populate("senderId", "displayName avatar");
                comment.fromNow = getFromNow(comment.createdAt);
                comment.isOwner = comment.senderId._id.toString() === userId;
                if (children.length > 0) {
                    comment.children = children;
                    await populateChildren(children);
                }
            }
        }

        await populateChildren(topLevelComments);
        return topLevelComments;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
