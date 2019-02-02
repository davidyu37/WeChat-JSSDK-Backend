var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

// Load your environment variables
require('dotenv').config(); // https://github.com/motdotla/dotenv#readme

// Load Wechat Stuff
const Wechat = require('wechat-jssdk'); // https://github.com/JasonBoy/wechat-jssdk#readme
const wechatConfig = {
  //set your oauth redirect url, defaults to localhost
  "wechatRedirectUrl": "http://yourdomain.com/wechat/oauth-callback",
  //"wechatToken": "wechat_token", //not necessary required
  "appId": process.env.APP_ID,
  "appSecret": process.env.APP_SECRET,
  // card: true, //enable cards
  // payment: true, //enable payment support
  // merchantId: '', //
  // paymentSandBox: true, //dev env
  // paymentKey: '', //API key to gen payment sign
  // paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
  //default payment notify url
  // paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
}

const wx = new Wechat(wechatConfig);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Generate Signature
app.get('/get-signature', async (req, res) => {
  //use async/await
  const signatureData = await wx.jssdk.getSignature(req.query.url);
  res.json(signatureData);
});

// Send User to WeChat Authentication Link
app.get('/auth-link', function(req, res) {
  // snsUserBaseUrl <- This gets user's OpenID without permission popup
  // snsUserInfoUrl <- This gets more user information with permission popop
  res.redirect(wx.oauth.snsUserBaseUrl);
});

// Get User Information
app.get('/wechat/oauth-callback', function (req, res) {
  //得到code，获取用户信息
  wx.oauth.getUserInfo(req.query.code)
          .then(function(userProfile) {
            console.log(userProfile)
            res.render("demo", {
              wechatInfo: userProfile
            });
          });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
