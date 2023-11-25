const { check } = require("express-validator");

const loginValidation = [
    check("email").isEmail().withMessage("Invalid email"),
    check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
const registerValidation = [
    check("email").isEmail().withMessage("Invalid email"),
    check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    check("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    }),
];

const EditProfileValidation = [
    check("displayName").notEmpty().withMessage("Display name is required"),
];
const addPostValidation = [
    check("content").custom((value, { req }) => {
        // Check if either content or image is provided
        if (!value && req.files.length === 0) {
            throw new Error(
                "At least one of the following fields is required: Content or Image"
            );
        }
        return true;
    }),
];

module.exports = {
    loginValidation,
    registerValidation,
    addPostValidation,
    EditProfileValidation,
};
