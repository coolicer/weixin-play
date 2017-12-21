var express = require('express'),
  weixin = require('weixin-api'),
  app = express(),
  bodyParser = require('body-parser');
  
var OAuth = require('wechat-oauth');
var setting = {
 id: '',  // 公众号id
 sceret: ''  // 公众号sceret
}
var oauthApi = new OAuth(setting.id, setting.sceret);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 接入验证
app.get('/', function(req, res) {
  // 签名成功
/*  if (weixin.checkSignature(req)) {
    res.status(200).send(req.query.echostr);
  } else {
    res.status(200).send('fail');
  } */
});

// config
weixin.token = 'coolicer';
// 监听事件消息
weixin.textMsg(function(msg) {

  var resMsg = {};

  switch (msg.content) {
    case "文本" :
      // 返回文本消息
      resMsg = {
        fromUserName : msg.toUserName,
        toUserName : msg.fromUserName,
        msgType : "text",
        content : "这是文本回复",
        funcFlag : 0
      };
      break;
  }
  weixin.sendMsg(resMsg);
});

// Start
app.post('/', function(req, res) {
  // loop
  weixin.loop(req, res);

});

app.get('/callback', function (req, res) {  

    console.log('----weixin callback -----')
    var code = req.query.code;

    //通过code获取accesstoken
    oauthApi.getAccessToken(code, function (err, result){
         //如果函数调用成功，会在result中得到access_token
        var accessToken = result.data.access_token;

        //以及openid;
        var openid = result.data.openid; 
        console.log('openid='+ openid);

        //然后通过openid获取用户信息   
        oauthApi.getUser(openid, function (err, result1) {

            console.log('use weixin api get user: ' + err)
            console.log(result)
            var oauth_user = result1;
            //打印出用户信息
            console.log("userinfo" + JSON.stringify(oauth_user, null, ' '));
	    res.end(JSON.stringify(oauth_user, null, ' '));
           //授权成功获取信息后，重定向到你要去的页面
           //这里随便，所以直接重定向到首页了，你可以换成其他任何页面     
           // res.redirect('/');
	});

      });
});

var callbackURL = 'http://wx.coolicer.com/callback';

app.get('/oauth2', function(req, res) {

  var url = oauthApi.getAuthorizeURL(callbackURL,'','snsapi_userinfo');
  //var url = oauthApi.getAuthorizeURL(callbackURL,'','snsapi_base');

  //重定向的回调地址，获取code，通过code换取openid和accesstoken ,通过openid获取用户信息
  //所有一起如此简单       
  res.redirect(url); 
})

app.listen(3000, ()=>{
  console.log('server started.');
});
