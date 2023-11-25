const mongoose = require("mongoose");
const { Schema } = mongoose;
// Define a schema for the images object
const imageSchema = new Schema({
    url: String,
    id: String,
});
const postSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentId: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["PUBLIC", "FRIEND", "ONLYME"],
        default: "PUBLIC",
    },
    numberOfLikes: {
        type: Number,
        default: 0,
        min: 0,
    },
    numberOfComments: {
        type: Number,
        default: 0,
        min: 0,
    },
    content: String,
    images: [imageSchema],
    updatedAt: {
        type: Date,
        required: false,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
