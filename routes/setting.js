const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        res.render("Setting", {
            currentUser: req.session.user,
            pageTitle: "Setting",
            currentRoute: "/setting",
        });
    } catch (error) {
        console.log("Error at get setting", error);
        res.render("Error", { message: error.message });
    }
});

module.exports = router;
