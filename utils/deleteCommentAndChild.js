const Comment = require("../models/comment");
module.exports = async function deleteCommentAndChild(commentId) {
    try {
        await Comment.deleteOne({ _id: commentId });
        const deletedChild = await Comment.deleteMany({ parentId: commentId });
        //    + 1 is it self comment
        return deletedChild.deletedCount + 1;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
