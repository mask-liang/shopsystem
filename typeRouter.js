
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

//类别表单路由
app.get('/type/add',(req,res)=>{
    res.render('type/add')
})
//去添加类别
app.post('/type/add',(req,res)=>{

    var form = new multiparty.Form({
        uploadDir:'./uploads'
    });
    
    form.parse(req, function(err, fields, files) {
        //files: 文件相关数据
        //fields: 普通表单数据
        let picpath = files.picname[0].path.split('\\')
        let name = fields.name[0]
        let picname = picpath[1]
        //console.log(picpath)
        let data = { name,picname }
        //console.log(data);

        MongoClient.connect( DBURL,(err,db)=>{

            //对数据库集合进行增、删、改、查
        
            // insertOne|deleteOne|updateOne|find
            db.collection('types').insertOne(data,(err,result)=>{
                //console.log('err',err)
                //console.log('result',result)
                res.send('<script type="text/javascript">alert("类别添加成功");history.back()</script>')
            })
        
            db.close()
        } )

    });
    
})
//类别列表渲染
app.get('/type/index',(req,res)=>{

    MongoClient.connect( DBURL,(err,db)=>{

        //对数据库集合进行增、删、改、查
    
        // insertOne|deleteOne|updateOne|find
        db.collection('types').find().toArray((err,typeResult)=>{
           // console.log(typeResult)
           res.render('type/index',{ typeResult })
        })
    
        db.close()
    } )

    
})

//删除类别
app.get('/type/delete',(req,res)=>{
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
   
        db.collection('types').deleteOne({ _id  },(err)=>{
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
app.get('/type/edit',(req,res)=>{

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
        db.collection('types').findOne( {_id} ,(err,typeResult)=>{
            //res.send(typeResult)
            res.render('type/edit',{ typeResult })
        })
    
        db.close()
    } )
    
})

app.post('/type/edit',(req,res)=>{

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
        let name = fields.name[0]//类别名称
        let _id = ObjectID( fields._id[0] )//类别名称
        let oldpicname = fields.oldpicname[0]//类别名称
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
               
        updateData = { name,picname }

        MongoClient.connect(DBURL,(err,db)=>{

            db.collection('types').updateOne({_id},updateData,(err,result)=>{
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