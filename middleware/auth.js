const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = async (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.redirect("/user/login");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        req.userId = decoded.userId;
        req.session.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.render("error", { message: "Invalid token" });
    }
};
module.exports = verifyToken;
