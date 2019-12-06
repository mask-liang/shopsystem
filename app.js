//引入express
let express = require('express')
let app = new express()


//设置ejs模板引擎
app.set('view engine','ejs')

//开放静态资源
app.use('/static',express.static('./static'))
app.use('/uploads',express.static('./uploads'))



//引入路由模块

let typeRouter = require('./typeRouter.js')
let productRouter = require('./productRouter.js')

// 设计路由
//-----------------------------------------------
app.get('/',(req,res)=>{
    res.send('系统首页. 点击<a href="/type/index">类别首页</a>')
})
app.use(typeRouter)
app.use(productRouter)
//-----------------------------------------------


app.listen(3000,function(){
    console.log('请在浏览器输入http://localhost:3000 或 http://127.0.0.1:3000')
})