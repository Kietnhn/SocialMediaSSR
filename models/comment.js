const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
    url: String,
    id: String,
});
const bookmarkSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    content: String,
    images: [imageSchema],
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Comment", bookmarkSchema);
