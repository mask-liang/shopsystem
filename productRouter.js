
let express = require('express')
let app = express.Router()

// 引入fs模块对文件进行删除、新建...操作
let fs = require('fs')
let path = require('path')

//数据库操作
let mongodb = require('mongodb')
let MongoClient = mongodb.MongoClient
const DBURL = 'mongodb://localhost:27017/shopsystem'
let ObjectID = mongodb.ObjectID


let multiparty = require('multiparty')

//商品表单路由
app.get('/product/add',(req,res)=>{
    //res.render('product/add')
    MongoClient.connect( DBURL,(err,db)=>{

        //对数据库集合进行增、删、改、查
    
        // insertOne|deleteOne|updateOne|find
        db.collection('types').find().toArray((err,typeResult)=>{
           // console.log(typeResult)
           res.render('product/add',{ typeResult })
        })
    
        db.close()
    } )
})
//去添加商品
app.post('/product/add',(req,res)=>{

    var form = new multiparty.Form({
        uploadDir:'./uploads'
    });
    
    form.parse(req, function(err, fields, files) {
        //files: 文件相关数据
        //fields: 普通表单数据
        let picpath = files.picname[0].path.split('\\')
        let name = fields.name[0]
        let picname = picpath[1]
        let price = fields.price[0]
        let desc = fields.desc[0]
        let typeid = ObjectID( fields.typeid[0] )
        //console.log(picpath)
        /*
        name
        picname
        price
        desc
        typeid
        */ 
        let data = { name,picname,price,desc,typeid }
        //console.log(data);
        // res.send(data)
        // return;
        MongoClient.connect( DBURL,(err,db)=>{

            //对数据库集合进行增、删、改、查
        
            // insertOne|deleteOne|updateOne|find
            db.collection('products').insertOne(data,(err,result)=>{
                //console.log('err',err)
                //console.log('result',result)
                res.send('<script type="text/javascript">alert("商品添加成功");history.back()</script>')
            })
        
            db.close()
        } )

    });
    
})
//类别列表渲染
app.get('/product/index',(req,res)=>{

    MongoClient.connect( DBURL,(err,db)=>{

        //对数据库集合进行增、删、改、查
    
        // insertOne|deleteOne|updateOne|find
        /*
        db.collection('products').find().toArray((err,result)=>{
           // console.log(result)
           res.render('product/index',{ result })
        })
        */
        db.collection('products').aggregate (
            {
                $lookup:{
                    from:'types',
                    localField:'typeid',
                    foreignField:'_id',
                    as:'typeInfo'
                }
            },(err,result)=>{
                //res.send( result )
                res.render('product/index',{ result })
            }
        )

    //    db.products.aggregate (
    //     {
    //         $lookup:{
    //             from:'types',
    //             localField:'typeid',
    //             foreignField:'_id',
    //             as:'typeInfo'
    //         }
    //     }
    // )
    
        db.close()
    } )

    
})

//删除类别
app.get('/product/delete',(req,res)=>{
    //res.send('去删除'+req.query.id)
    let { _id,picname } = req.query
    _id = ObjectID( _id )

    // 在node中（在后端操作路径，把绝对地址动态化）
    let filepath = path.resolve( __dirname,'uploads',picname )
    
    //res.send(filepath)
    //return;
    MongoClient.connect( DBURL,(err,db)=>{

        //对数据库集合进行增、删、改、查
    
        // insertOne|deleteOne|updateOne|find
   
        db.collection('products').deleteOne({ _id  },(err)=>{
            //console.log(err,'err')
            if(err){
                res.send('<script type="text/javascript">alert("删除失败");history.back()</script>') 
                return;
            }

            fs.unlinkSync( filepath );
            //res.send('删除')
            res.send('<script type="text/javascript">alert("删除成功");history.back()</script>')
        })
    
        db.close()
    } )
})

//编辑
app.get('/product/edit',(req,res)=>{

    let { _id } = req.query
    _id = ObjectID( _id )

    MongoClient.connect( DBURL,(err,db)=>{

        //对数据库集合进行增、删、改、查
    
        // insertOne|deleteOne|updateOne|find
        // db.collection('types').find({_id}).toArray((err,typeResult)=>{
        //    // console.log(typeResult)
        //   // res.render('type/index',{ typeResult })
        //   res.send(typeResult)
        // })
        db.collection('products').findOne( {_id} ,(err,result)=>{
            //res.send(result)
            db.collection('types').find().toArray((err,typeResult)=>{
                // console.log(typeResult)
                //res.render('product/add',{ typeResult })
                res.render('product/edit',{ result,typeResult })
                //res.send( { result,typeResult } )
             })
           
        })
    
    } )
    
})

app.post('/product/edit',(req,res)=>{

    // if( picname有值则代表用户想上传新的图片 ){
    //     所以从picname取值
    // }else{
    //     picname = oldpicname
    // }
    var form = new multiparty.Form({
        uploadDir:'./uploads'
    });
    
    form.parse(req, function(err, fields, files) {
        //files: 文件相关数据
        //fields: 普通表单数据
        let picpath = files.picname[0].path.split('\\')
        let name = fields.name[0]//商品名称
        let _id = ObjectID( fields._id[0] )//商品id
        let oldpicname = fields.oldpicname[0]//商品原图片名称
        let desc = fields.desc[0]//商品详情
        let price = fields.price[0]//商品价格
        let typeid = ObjectID( fields.typeid[0] )//商品类别id
        let size = files.picname[0].size//文件大小，（判断用户是否选择了新的图片）
        let picname = picpath[1]//图片的名称
        //console.log(picpath)
        //let data = { name,picname }
        //console.log(data);
        console.log( fields )
        // 无论用户上传文件与否，我们都把name和picname修改掉
        let updateData = {  }
        if( !size ){
            picname = oldpicname
        }
               
        updateData = { name,picname,desc,price,typeid }
        //res.send( updateData )
       // return;
        MongoClient.connect(DBURL,(err,db)=>{

            db.collection('products').updateOne({_id},updateData,(err,result)=>{
                if(!err){
                    res.send('<script type="text/javascript">alert("更新成功");history.back()</script>')
                    return
                }
                res.send('<script type="text/javascript">alert("更新失败");history.back()</script>')
            })

        })

        //res.send( updateData  )
    });
})


module.exports = app