const path = require('path')
var fs = require("fs");
var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  timezone:'Asia/Shanghai',
  port: '3306',
  database: 'car'
});

connection.connect();


var express = require('express');
var multer = require('multer');


var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

//配置diskStorage来控制文件存储的位置以及文件名字等
var storage = multer.diskStorage({
  //确定图片存储的位置
  destination: function (req, file, cb){
    cb(null, './public/uploadImgs')
  },
  //确定图片存储时的名字,注意，如果使用原名，可能会造成再次上传同一张图片的时候的冲突
  filename: function (req, file, cb){
    cb(null, Date.now()+file.originalname)
  }
});
//生成的专门处理上传的一个工具，可以传入storage、limits等配置
var upload = multer({storage: storage});

//接收上传图片请求的接口
app.post('/upload', upload.single('file'), function (req, res, next) {
  //图片已经被放入到服务器里,且req也已经被upload中间件给处理好了（加上了file等信息）
  //线上的也就是服务器中的图片的绝对地址
  var url = '/uploadImgs/' + req.file.filename;
  var modSql = `UPDATE user_list SET head_portrait = "${url}" WHERE account = "${req.body.account}"`;
  connection.query(modSql, function (err, result) {
    if(err){
      console.log('上传头像失败 err',err.message);
      let data = {
        code : '1',
        msg : '上传头像失败'
      };
      res.json(data);
      return;
    }
    res.json({
      code : '2',
      msg : '上传头像成功',
      data : url
    });
  });
});

// 已经抢了的订单，取消订单
app.post('/cancel_order', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let order_id = req.body.order_id; //接单人账号
  var querySql = 'update order_list set get_order_people = null WHERE order_id=?';
  var querySqlParams = [order_id];
  connection.query(querySql, querySqlParams, function (err, result) {
    if(err){
      console.log('err', err);
      let data = {
        msg : '取消订单失败',
        code : 1
      };
      res.end(JSON.stringify(data));
    }
    let data = {
      msg : '取消订单成功',
      code : 2,
    };
    res.end(JSON.stringify(data));
  });
});


// 自己的抢单列表
app.post('/get_my_order_list', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let get_order_people = req.body.get_order_people; //接单人账号
  var querySql = 'SELECT * FROM order_list WHERE get_order_people=? limit 2 offset ?';
  var querySqlParams = [get_order_people, req.body.pageIndex * 2];
  // 查询数据库里有没有这个账号
  connection.query(querySql, querySqlParams, function (err, result) {
    if(err){
      console.log('err', err);
      let data = {
        msg : '获取抢单列表失败',
        code : 1
      };
      res.end(JSON.stringify(data));
    }
    let data = {
      msg : '获取抢单列表成功',
      code : 2,
      result
    };
    res.end(JSON.stringify(data));
  });
});

// 抢单
app.post('/get_order', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let account = req.body.account; //发单人账号
  let get_order_people = req.body.get_order_people; //接单人账号
  let order_id = req.body.order_id; //订单id
  console.log('account', account);
  console.log('get_order_people', get_order_people);
  console.log('order_id', order_id);
  var modSql = 'UPDATE order_list SET get_order_people = ? WHERE order_id = ?';
  var modSqlParams = [get_order_people, parseInt(order_id)];
  // 查询数据库里有没有这个账号
  connection.query(modSql, modSqlParams, function (err, result) {
    if(err){
      console.log('err', err);
      let data = {
        msg : '抢单失败',
        code : 1
      };
      res.end(JSON.stringify(data));
      return;
    }
    let data = {
      msg : '抢单成功',
      code : 2
    };
    res.end(JSON.stringify(data));
  });
});



// 获取博客详情
app.get('/get_order_detail', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  // 查看blog_list数据库里的这个账号对应的数据，把这条数据的title和content返回给前端
  let querySql = `SELECT * FROM blog_list WHERE id="${req.query.id}"`;
  connection.query(querySql, function (err, result) {
    if(err){
      console.log('博客详情 err',err.message);
      return;
    }
    console.log('result', result);
    res.end(JSON.stringify(result));
  });
  // 当获取详情时，就增加一个阅读量
  let modSql = `UPDATE blog_list SET read_num = read_num+1 WHERE id = "${req.query.id}"`;
  connection.query(modSql, function (err, result) {
    if(err){
      console.log('博客详情 err',err.message);
      return;
    }
  });
});


app.get('/get_list', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  // 查看blog_list数据库里的这个账号对应的数据，把这条数据的title和content返回给前端
  if(!req.query.pageIndex){
    req.query.pageIndex = 0;
  }
  req.query.pageIndex = Number(req.query.pageIndex);

  let querySql;
  if(req.query.account){
    querySql = `SELECT * FROM order_list WHERE account="${req.query.account}"  limit 2 offset ${req.query.pageIndex * 2}`;
  }
  else{
    querySql = `SELECT * FROM order_list  limit 2 offset ${req.query.pageIndex * 2}`;
  }
  connection.query(querySql, function (err, result) {
    if(err){
      console.log('获取列表 err',err.message);
      return;
    }
    let data = {
      code : 2,
      msg : '获取列表成功',
      result
    };
    res.end(JSON.stringify(data));
  });
});

app.post('/add_order', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  const account = req.body.account;
  const seat = req.body.seat;
  const use_car_time = req.body.use_car_time;
  const start_city = req.body.start_city;
  const end_city = req.body.end_city;
  const mileage = req.body.mileage;
  const addSql = 'INSERT INTO order_list(account, seat, use_car_time, start_city, end_city, mileage) VALUES(?,?,?,?,?,?)';
  var  addSqlParams = [account, seat, use_car_time, start_city, end_city, mileage];
  connection.query(addSql, addSqlParams, function (err, result) {
    if(err){
      console.log('添加订单 err',err.message);
      res.end('添加失败');
      return;
    }
    res.end('添加成功');
  });
});

app.get('/delete_blog', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let id = req.query.id;
  var delSql = `DELETE FROM blog_list where id=${id}`;
  connection.query(delSql, function (err, result) {
    if(err){
      console.log('删除 err',err.message);
      return;
    }
  });
  res.end('删除成功');
});

app.get('/login', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let account = req.query.account;
  let password = req.query.password;

  // 查看数据库里是否存在这个账号
  let querySql = `SELECT * FROM user_list where account="${account}"`;
  connection.query(querySql, function (err, result) {
    if(err){
      console.log('查询err',err.message);
      return;
    }
    if(result.length == 0){
      let data = {
        msg : '该账号还未注册，请先注册',
        code : 1
      };
      res.end(JSON.stringify(data));
      // connection.end();
      return;
    }
    else{
      // 判断用户输入的密码是否正确
      if(result[0].password == password){
        delete result[0].password;
        result[0].msg = '登录成功';
        result[0].code = '2';
        res.end(JSON.stringify(result[0]));
        // res.end('登录成功');
      }
      else{
        let data = {
          msg : '密码不正确，请重新输入密码',
          code : 1
        };
        res.end(JSON.stringify(data));
      }
    }
  });
});

app.get('/register', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
  let account = req.query.account;
  let password = req.query.password;
  let head_portrait = req.query.head_portrait;

  let querySql = `SELECT * FROM user_list where account="${account}"`;
  // 查询数据库里有没有这个账号
  connection.query(querySql, function (err, result) {
    if(err){
      return;
    }
    if(result.length > 0){
      res.end('该账号已经注册');
      // connection.end();
      return;
    }
    else{
      var addSql = 'INSERT INTO user_list(account,password, head_portrait) VALUES(?,?,?)';
      var addSqlParams = [account, password, head_portrait];
      //查找id=1的那条数据
      connection.query(addSql, addSqlParams, function (err, result) {
        if(err){
          return;
        }
        // connection.end();
        res.end('注册成功');
      });
    }
  });
});

app.listen(8081);