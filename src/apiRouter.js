
const express = require('express')
const mysql = require('mysql');

//配置数据库
const db = mysql.createPool({
  host: 'xxxx',
  user: 'xxxx',
  password: 'xxxx',
  database: 'xxxx',
})

const apiRoute = express.Router();
apiRoute.get('/historyTime', (req, res) => {
  let sqlStr = 'select * from t_text_info where status = 0 order by id asc limit 1'
  db.query(sqlStr, req.query.id, (err, resultsdata) => {
    if (err) return console.error(err.message)
    console.log(resultsdata
    );
    if (resultsdata.length <= 0) {
      let fail = '数据不存在，请重新查询！'
      res.send({
        code: 500,
        message: "请求失败！",
        result: fail
      })
    } else {
      res.send({
        code: 200,
        message: "请求成功！",
        result: resultsdata
      })
      let updateSqlStr = 'update t_text_info set status=1 where id=?'
      db.query(updateSqlStr, req.query.id, (err, resultsdata) => {
        console.log(resultsdata);
      })
    }
  })
})

module.exports = apiRoute
