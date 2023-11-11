﻿const server = "127.0.0.1";
const port = "3000";
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

//首页显示内容
app.get("/", function (req, res) {
  res.send("hello world");
});

//获取系统监听端口
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
      }
    });
  });

//获取系统进程表
app.get("/status", function (req, res) {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    }
    else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

//启动e
app.get("/e", function (req, res) {
  let cmdStr = "bash entrypoint.sh >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Web 执行错误：" + err);
    }
    else {
      res.send("entrypoint start ok");
    }
  });
});

//获取系统版本、内存信息
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    }
    else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

app.use(
  "/",
  createProxyMiddleware({
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
    pathRewrite: {
      // 请求中去除/
      "^/": "/"
    },
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    ws: true // 是否代理websockets
  })
);

//启动核心脚本运行web和哪吒
exec('bash entrypoint.sh', function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));