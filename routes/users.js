const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl, isLoggedIn } = require("../middleware");
const userController = require("../controllers/users.js");

router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));
router.post("/wishlist/:id", isLoggedIn, wrapAsync(userController.toggleWishlist));

router.get("/dashboard", isLoggedIn, wrapAsync(userController.renderDashboard));

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        savedRedirectUrl,
        passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
        userController.login
    );

router.get("/logout", userController.logout);

module.exports = router;
