const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require("passport");

dotenv.config(); // process.env
//process.env.COOKIE_SECRET 있음
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig();  // passport/index.js 파일에 있는 export 함수 실행됨
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync( {force : true} )       //  배포 시에 false 교체!!!!
    .then(() => {
        console.log("database connection successfully");
    })
    .catch((err) =>{
        console.error(err);
    })

app.use(morgan('dev'));     // logging ,
app.use(express.static(path.join(__dirname, 'public')));    // public 폴더를 static 폴더로 만들어줌
app.use('/img', express.static(path.join(__dirname, 'uploads')));    // uploads 파일에서 사진을 서버에서 가져올 수 있다.

app.use(express.json());                                    // req.body를 ajax json 요청을 받을 수 있게
app.use(express.urlencoded({extended: true}));     // form 요청을 받을 수 있게
app.use(cookieParser(process.env.COOKIE_SECRET));           // {connect.sid: 1231656161(세션쿠키)}로 만들어줌

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET, // cookieParser의 인자와 같은 값으로 설정
    cookie:{httpOnly: true, secure: false}
}));
app.use(passport.initialize());     // req.user, req.login, req.isAuthenticate, req.logout 생성해줌
app.use(passport.session());        //connect.sid 라는 이름으로 세션 쿠키가 브라우저로 전송
// 브라우저 connect.sid=1231656161(세션쿠키)

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next)=> {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.` );
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 배포모드가 아닐 경우만 에러를 띄움
    res.status(err.status || 500);
    res.render('error'); //  넌적스를 통해 자동으로 views 파일의 error 파일로 넘겨준다.
});


module.exports = app;