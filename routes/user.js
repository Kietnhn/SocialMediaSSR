const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const {
    loginValidation,
    registerValidation,
} = require("../middleware/validateReq");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const verifyToken = require("../middleware/auth");

// router.get("/", async (req, res) => {
//     try {
//         const user = await User.findById(req.userId).select("-password");
//         req.session;
//         if (!user)
//             return res
//                 .status(400)
//                 .json({ success: false, message: "User not found" });
//         res.render("partials/CurrentUser", { user });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// });
router.get("/login", async (req, res) => {
    try {
        res.render("Login.ejs", {
            pageTitle: "Login",
            errors: [],
            errorMessage: "",
            oldInputs: {
                email: "",
                password: "",
            },
        });
    } catch (error) {
        console.log("Error at get login", error);
        res.render("error", { message: error.message });
    }
});
router.get("/logout", verifyToken, async (req, res) => {
    try {
        delete req.session.token;
        delete req.session.user;
        res.render("Login.ejs", {
            pageTitle: "Login",
            errors: [],
            errorMessage: "",
            oldInputs: {
                email: "",
                password: "",
            },
        });
    } catch (error) {
        console.log("Error at get login", error);
        res.render("error", { message: error.message });
    }
});
router.get("/register", async (req, res) => {
    try {
        res.render("Register.ejs", {
            pageTitle: "Register",
            errors: [],
            errorMessage: "",
            oldInputs: {
                email: "",
                password: "",
                confirmPassword: "",
            },
        });
    } catch (error) {
        console.log("Error at get login", error);
        res.render("error", { message: error.message });
    }
});

//@router POST api/auth/register
//@desc Register user
//@access public

router.post("/register", registerValidation, async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.render("register", {
            pageTitle: "Register",
            errors: errors.array(),
            errorMessage: "",
            oldInputs: {
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            },
        });
    }

    try {
        // Check for existing user
        const user = await User.findOne({ email });

        if (user) {
            return res.render("register", {
                pageTitle: "Register",
                errors: [
                    {
                        msg: "Email already in use",
                        path: "email",
                    },
                ],
                oldInputs: {
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                },
                errorMessage: "",
            });
        }
        const displayName = email.split("@")[0];
        // All good
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({
            background: null,
            avatar: null,
            displayName,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        // Return token
        const accessToken = jwt.sign(
            { userId: newUser._id },
            process.env.ACCESS_TOKEN_SECRET
        );
        req.session.token = accessToken;
        res.redirect("/");
        // res.json({ success: true, accessToken });
    } catch (error) {
        console.log("Error at register", error);
        res.render("error", { message: error.message });
    }
});
//@router POST api/auth/login
//@desc Login user
//@access public

router.post("/login", loginValidation, async (req, res) => {
    const errors = validationResult(req);

    const { email, password } = req.body;
    if (!errors.isEmpty()) {
        return res.render("login", {
            pageTitle: "Login",
            errors: errors.array(),
            errorMessage: "",
            oldInputs: {
                email: email,
                password: password,
            },
        });
    }

    try {
        // Check for existing user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", {
                pageTitle: "Login",
                errors: [
                    {
                        msg: "Incorrect username or password",
                        path: "email",
                    },
                    {
                        msg: "Incorrect username or password",
                        path: "password",
                    },
                ],
                errorMessage: "",
                oldInputs: {
                    email: email,
                    password: password,
                },
            });
        }
        // username found
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            return res.render("login", {
                pageTitle: "Login",
                errors: [
                    {
                        msg: "Incorrect username or password",
                        path: "email",
                    },
                    {
                        msg: "Incorrect username or password",
                        path: "password",
                    },
                ],
                errorMessage: "Incorrect username or password",
                oldInputs: {
                    email: email,
                    password: password,
                },
            });
        }
        // Return token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET
        );
        req.session.token = accessToken;
        res.redirect("/");
    } catch (error) {
        console.log("Error at login", error);
        res.render("error", { message: error.message });
    }
});
module.exports = router;
