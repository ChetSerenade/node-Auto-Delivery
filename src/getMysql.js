const express = require('express');
const apiRoute = require('./apiRouter')

const app = express();

//配置解析表单数据的中间件
app.use(express.urlencoded({
  extended: false
}));

const cors = require('cors')
app.use(cors())

app.use('/api', apiRoute)

//端口
app.listen('xxxx', (req, res) => {
  console.log('http://xxxx');
})
