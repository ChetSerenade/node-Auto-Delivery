// index.js
"use strict"

const nodeMailer = require('nodemailer');
const axios = require('axios');
const schedule = require('node-schedule');

//接口
const checkInApi = "https://api.juejin.cn/growth_api/v1/check_in"
const drawApi = "https://api.juejin.cn/growth_api/v1/lottery/draw"
const articleApi = "https://api.juejin.cn/content_api/v1/short_msg/publish"
const cookieInfo = `_ga=GA1.2.1321116537.1645776876; __tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227068557831083017764%2522%252C%2522user_unique_id%2522%253A%25227068557831083017764%2522%252C%2522timestamp%2522%253A1645776876510%257D; n_mh=EavPya4RzlYXP6hk-Y-NYZZ-GL2RoRGNzPQy3nSejCI; sid_guard=40a3b00b7c04117360d96107c3dbd0b7%7C1651028323%7C31536000%7CThu%2C+27-Apr-2023+02%3A58%3A43+GMT; uid_tt=8c0d342341fae0823c5d3ec1bcd53fa9; uid_tt_ss=8c0d342341fae0823c5d3ec1bcd53fa9; sid_tt=40a3b00b7c04117360d96107c3dbd0b7; sessionid=40a3b00b7c04117360d96107c3dbd0b7; sessionid_ss=40a3b00b7c04117360d96107c3dbd0b7; sid_ucp_v1=1.0.0-KGQ1MGNiMDJiYTgwNTQ5Yjg4MTAwNzljMWFiYWYyYWI2NjJhMjI5NDIKFwiNquDA_fXFBhDj4qKTBhiwFDgCQPEHGgJsZiIgNDBhM2IwMGI3YzA0MTE3MzYwZDk2MTA3YzNkYmQwYjc; ssid_ucp_v1=1.0.0-KGQ1MGNiMDJiYTgwNTQ5Yjg4MTAwNzljMWFiYWYyYWI2NjJhMjI5NDIKFwiNquDA_fXFBhDj4qKTBhiwFDgCQPEHGgJsZiIgNDBhM2IwMGI3YzA0MTE3MzYwZDk2MTA3YzNkYmQwYjc; MONITOR_WEB_ID=f9f18b45-5e19-40ee-b91f-3a153a1ac7fc; _gid=GA1.2.490729673.1657498462; _tea_utm_cache_2608={%22utm_source%22:%22infinitynewtab.com%22}; _gat=1`

// 发送邮件的配置
const emailInfo = {
  "user": "xxxx",
  "from": "xxxx",
  "to": "xxxx",
  "pass": "xxxx"  
}

// 请求数据
const chegetData = async (getData) => {
  let { data } = await axios({ url: getData, method: 'get' });
  return data
}

// 请求签到接口
const checkIn = async () => {
  let { data } = await axios({ url: checkInApi, method: 'post', headers: { Cookie: cookieInfo } });
  return data
}

// 请求抽奖接口
const draw = async () => {
  let { data } = await axios({ url: drawApi, method: 'post', headers: { Cookie: cookieInfo } });
  return data
}

// 发送沸点
const article = async (title, book_title, question, feel) => {
  let { data } = await axios({
    url: articleApi, method: 'post', headers: { Cookie: cookieInfo }, data: {
      content: `📌 书籍：${book_title}\n  👉 推荐指数：🌟🌟🌟🌟🌟\n\n ${title}\n\n  感悟/想法：${feel}\n ${question} `,
      topic_id: "6824710202248396813",
      sync_to_org: false
    },
  });
  return data
}

// 签到完成 发送邮件
const sendQQEmail = async (subject, html) => {
  let { user, from, to, pass } = emailInfo;
  const transporter = nodeMailer.createTransport({ service: 'qq', auth: { user, pass } });
  transporter.sendMail({ from, to, subject, html }, (err) => {
    if (err) return console.log(`发送邮件失败：${err}`);
    console.log('发送邮件成功')
  })
}

/**
 *每分钟的第30秒触发： '30 * * * * *'
 *每小时的1分30秒触发 ：'30 1 * * * *'
 *每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
 *每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
 *2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
 *每周1的1点1分30秒触发 ：'30 1 1 * * 1'
 **/
let i = 0;
let trigger = schedule.scheduleJob('xxxx', async () => {
  i++;
  const getData = `http://127.0.0.1:2022/api/historyTime?id=${i}`   // 接口地址
  const cheGetData = await chegetData(getData);
  let title = cheGetData.result[0].title
  let book_title = cheGetData.result[0].book_title
  let question = cheGetData.result[0].question
  let feel = cheGetData.result[0].feel
  const checkInData = await checkIn();
  const drawData = await draw();
  const articleDate = await article(title, book_title, question, feel);
  if (checkInData.data && drawData.data) {
    sendQQEmail('掘金签到和抽奖成功', `掘金签到成功！今日获得${checkInData.data.incr_point}积分，当前总积分：${checkInData.data.sum_point}。 掘金免费抽奖成功, 获得：${drawData.data.lottery_name}\n 您的沸点地址是：https://juejin.cn/pin/${articleDate.data.msg_id}`);
  } else if (checkInData.data && !drawData.data) {
    sendQQEmail('掘金签到成功, 抽奖失败', `掘金签到成功！今日获得${checkInData.data.incr_point}积分，当前总积分：${checkInData.data.sum_point}。 掘金免费抽奖失败, ${JSON.stringify(drawData)}\n 您的沸点地址是：https://juejin.cn/pin/${articleDate.data.msg_id}`);
  } else if (!checkInData.data && drawData.data) {
    sendQQEmail('掘金签到失败, 抽奖成功', `掘金签到失败！${JSON.stringify(checkInData)}。 掘金免费抽奖成功, 获得：${drawData.data.lottery_name}\n 您的沸点地址是：https://juejin.cn/pin/${articleDate.data.msg_id}`);
  } else if (!checkInData.data && !drawData.data) {
    sendQQEmail('掘金签到和抽奖失败', `掘金签到失败！${JSON.stringify(checkInData)}。 掘金免费抽奖失败, ${JSON.stringify(drawData)}\n 您的沸点地址是：https://juejin.cn/pin/${articleDate.data.msg_id}`);
  }
});


