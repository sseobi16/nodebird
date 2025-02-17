const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('../middlewares');
const {join, login, logout} = require('../controllers/auth');
const router = express.Router();

// join.html로 부터 요청이 들어옴
router.post('/join', isNotLoggedIn, join);          // POST /auth/join
router.post('/login', isNotLoggedIn, login);        // POST /auth/login
router.get('/logout', isLoggedIn, logout);          // GET  /auth/logout


// auth/kakao
router.get('/kakao', passport.authenticate('kakao'))   // 카카오톡 로그인 화면으로 redirect
// 카카오톡 로그인 화면에서 auth/kakao/callback로 redirect

// auth/kakao/callback
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/?loginError=카카오로그인 실패',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;