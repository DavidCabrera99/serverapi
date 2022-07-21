const mysql = require('mysql');
const express = require('express');
var busboy = require('connect-busboy');
var path = require('path');
var fs = require('fs-extra');

const app = express();
const PORT = 3002
app.use('/img',express.static(path.join(__dirname, 'img')))
app.use(express.json());
app.use(busboy());

//Get All Users
app.get("/api/get/users", (req, res) => {
    connection.query("SELECT * FROM users",(err,result)=>{
        if(err){
            console.log(err)
        }
        res.send(result)
    })
})

//Add User
app.post("/api/add/user", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const age = req.body.age;
    
    console.log(`User ${username} email ${email} age ${age}`)
    
    connection.query("INSERT INTO users (name, age, email) VALUES (?, ?,?)",[username,age,email],(err, result)=>{
        if (err) {
            console.error(err);
            res.send(err);
        }else{
            console.log(result);
            res.send(result);
        }
    })
})

//Upload a file
app.post('/api/uploadfile',(req, res)=>{
    var fstream;
    req.pipe(req.busboy)
    req.busboy.on('file',(fieldname,file, filename)=>{
        console.log("Uploading..."+filename+" "+fieldname+" "+file)
        console.log(filename)

        var timestamp = new Date().toISOString().replace(/[-:.]/g,"")
        var random = (""+Math.random()).substring(2,8)
        var randomname = timestamp + random;
        
        fstream = fs.createWriteStream(__dirname+'/img/'+randomname+".png")
        file.pipe(fstream)
        fstream.on('close',()=>{
            console.log("Uploaded file")
            res.send(JSON.stringify(
                {
                    status: 'success',
                    name: randomname+".png"
                }
            ))
        })
    })
})

//Get all blogs
app.get('/api/get/blogs',(req, res)=>{
    connection.query("SELECT * FROM post ORDER BY date_created DESC",(err,result)=>{
        if(err){
            console.log(err)
        }
        res.send(JSON.stringify({blogs:result}))
    })
})


//Add Blog
app.post('/api/add/blog', (req, res)=>{
    const title = req.body.title;
    const body = req.body.body;
    const description = req.body.description;
    const image = req.body.image;

    connection.query("INSERT INTO post (title, body, img_link, short_desc, date_created) VALUES (?, ?, ?, ?,NOW())",[title, body, image, description],(err, result)=>{
        if (err) {
            console.error(err);
            res.send(err);
        }else{
            console.log(result);
            res.send(result);
        }
    })
})

//Add comment
app.post('/api/add/comment', (req, res)=>{
    const email = req.body.email;
    const comment = req.body.comment;
    const id = req.body.id;

    connection.query("INSERT INTO comments (author, comment, post_id, date_created) VALUES (?, ?, ?,NOW())",[email, comment, id],(err, result)=>{
        if (err) {
            console.error(err);
            res.send(err);
        }else{
            console.log(result);
            connection.query("SELECT * FROM comments WHERE post_id =?",[id,],(err, result)=>{
                if (err) {
                    console.error(err);
                    res.send(err);
                }else{
                    console.log(result);
                    res.send(JSON.stringify({comments:result}));
                }
            })
        }
    })
})

//Get Blog by id
app.get('/api/blog/get/:id',(req, res)=>{
    const id = req.params.id;
    console.log(id);
    connection.query("SELECT * FROM post WHERE pid =?",[id,],(err, result)=>{
        if (err) {
            console.error(err);
            res.send(err);
        }else{
            console.log(result);
            res.send(JSON.stringify(result[0]));
        }
    })
})

//Get Comments from a blog id
app.get('/api/blog/get/comments/:id',(req, res)=>{
    const id = req.params.id;
    console.log(id);
    connection.query("SELECT * FROM comments WHERE post_id =?",[id,],(err, result)=>{
        if (err) {
            console.error(err);
            res.send(err);
        }else{
            console.log(JSON.stringify({comments:result}));
            res.send(JSON.stringify({comments:result}));
        }
    })
})


const mysql_user = {
    host: 'sql.freedb.tech',
    user: 'freedb_david',
    password: 'n!KKHcUpC8GjWdH',
    database: 'freedb_myreactdb',
    port: 3306,
}
const connection = mysql.createConnection(mysql_user, {
    multipleStatements: true,
})


app.listen(PORT, function(){
    console.log(`Server listening on port ${PORT}`)
})