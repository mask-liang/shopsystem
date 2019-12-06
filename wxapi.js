// 写接口服务 4000端口
// 接口返回的只是json字符串数据

//1. 引入express
let express = require('express')
let app = new express()


//引入body-parser中间件获取post请求过来的数据
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//2. 数据库操作所需基本配置
let mongodb = require('mongodb')
let MongoClient = mongodb.MongoClient
const DBURL = 'mongodb://localhost:27017/shopsystem'
let ObjectID = mongodb.ObjectID


// 3. 开启uploads的静态服务
app.use('/uploads',express.static('./uploads'))


app.get('/',(req,res)=>{
    res.send('当你看见这个页面，代表数据服务已启动，例如：访问<a href="http://localhost:4000/wxapiGetTypes">localhost:4000/wxapiGetTypes</a>可以拿到类别数据')
})

// 获取所有类别
app.get('/wxapiGetTypes',(req,res)=>{

    let results = {}
    MongoClient.connect(DBURL,(err,db)=>{
        db.collection('types').find().toArray( (err,result)=>{


            if( err ){
               results = {
                    statusCode:500,
                    statusText:'请稍后再试'
                }
            }else{
                results = {
                    statusCode:200,
                    statusText:'OK',
                    result
                }
            }

            res.send( results )
        } )
    })

    
})


// 获取一组商品
app.get('/wxapiGetProducts',(req,res)=>{

    let results = {}
    MongoClient.connect(DBURL,(err,db)=>{
        db.collection('products').find().toArray( (err,result)=>{


            if( err ){
               results = {
                    statusCode:500,
                    statusText:'请稍后再试'
                }
            }else{
                results = {
                    statusCode:200,
                    statusText:'OK',
                    result
                }
            }

            res.send( results )
        } )
    })

    
})

app.get('/wxapiGetDetailById',(req,res)=>{

    let _id = ObjectID( req.query._id )

    MongoClient.connect(DBURL,(err,db)=>{

        db.collection('products').findOne({ _id },(err,result)=>{
            let results = {
                statusCode:200,
                statusText:'OK',
                result
            }

            res.send( results )
        })
        db.close()
    })
})


//保存用户的购物车信息
app.post('/wxapiSetSaveCart',(req,res)=>{

    // 1. 如果用户之前未保存信息则需要添加 insert
    // 2. 如果用户之前有过保存信息的记录则需要update

    let results = {
       
    }

    //console.log( req.body  )
    //res.send( req.body )
    results = req.body
    MongoClient.connect(DBURL,(err,db)=>{

        // find

        db.collection('carts').insert(results,(err,result)=>{
            if( !err ){
                results = {
                    statusCode:200,
                    statusText:'OK',
                    result
                }
                res.send(results)
                return
            }
            results = {
                statusCode:500,
                statusText:'err',
                error:err
            }
            res.send(results)
            return

        })

        db.close()
    })
  
})

app.listen(4000,function(){
    console.log('请在浏览器输入http://localhost:4000 或 http://127.0.0.1:4000')
})