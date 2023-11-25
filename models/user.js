const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new Schema({
    url: String,
    id: String,
});
const userSchema = new mongoose.Schema({
    password: {
        type: String,
        minLength: 6,
        required: true,
    },
    displayName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: imageSchema,
    background: imageSchema,
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
