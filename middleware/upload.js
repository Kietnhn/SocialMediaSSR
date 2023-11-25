const multer = require("multer");
const cloudinary = require("../configs/cloudinaryConfig");

// const fs = require("fs");
// // const path = require("path");
// const uploadDirectory = "uploads/";

// // Create the upload directory if it doesn't exist
// if (!fs.existsSync(uploadDirectory)) {
//     fs.mkdirSync(uploadDirectory);
// }
// const storage = multer.diskStorage({
//     destination: "uploads/", // Change the destination to 'uploads/' if it's in the root directory
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });
// const upload = multer({ storage });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
async function handleUpload(file) {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = "data:" + file.mimetype + ";base64," + b64;
    const res = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
    });
    return { url: res.url, id: res.public_id };
}
async function destroySingleImage(imageId) {
    try {
        await cloudinary.uploader.destroy(imageId);
    } catch (error) {
        console.error("Error deleting images:", error);
    }
}
async function destroyImages(imageIds) {
    try {
        // Use a loop or Promise.all to delete multiple images
        for (const imageId of imageIds) {
            await cloudinary.uploader.destroy(imageId);
        }
    } catch (error) {
        console.error("Error deleting images:", error);
    }
}
module.exports = { upload, handleUpload, destroyImages, destroySingleImage };
