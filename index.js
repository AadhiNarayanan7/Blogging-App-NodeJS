import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs, { copyFileSync } from "fs";
import cookieParser from "cookie-parser";
import { arrayBuffer } from "stream/consumers";
import multer, { diskStorage } from "multer";
const __dirname = dirname(fileURLToPath(import.meta.url));

const port=5000;
const server=express();

server.use(cookieParser());
server.use(express.static("public"));
server.use(express.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './views/user/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname)
    }
  })
  
  const upload = multer({ storage: storage })

server.listen(port,()=>{
    console.log("listening on port.");
});

server.post("/login",(req,res)=>{
    res.cookie("user",req.body.emailid)
    var blogcontent="";
    if(!fs.existsSync("./views/user/"+req.body.emailid)) {
        fs.mkdirSync("./views/user/"+req.body.emailid);
        res.render("login.ejs",{user: req.body.emailid, blog: blogcontent});
    }
    if(!fs.existsSync("./public/images/"+req.body.emailid)) {
        fs.mkdirSync("./public/images/"+req.body.emailid);
        res.render("login.ejs",{user: req.body.emailid, blog: blogcontent});
    }
    else{
        fs.readdir("./views/user/"+req.body.emailid,(err,files)=>{
            if(err) throw err;
            else{
                var len=files.length;
                var textcontent="";
                if(len>0){
                    if(len>20) var len=20;
                    for(var i=0;i<len;i++){
                        textcontent=fs.readFileSync("./views/user/"+req.body.emailid+"/"+files[i]);
                        if(textcontent.length>400){
                            blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent.slice(0,400)+"...</p><a style='align-self:flex-end;' href='/openblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Read more...</a></div>"
                        }
                        else{
                            blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent+"...</p><a style='align-self:flex-end;' href='/openblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Read more...</a></div>"
                        }
                    }
                }
            }
            res.render("login.ejs",{user: req.body.emailid, blog: blogcontent});
        });
    }
});

server.get("/login",(req,res)=>{
    var blogcontent="";
    if(!fs.existsSync("./views/user/"+req.cookies.user)) {
        fs.mkdirSync("./views/user/"+req.cookies.user);
        res.render("login.ejs",{user: req.cookies.user, blog: blogcontent});
    }
    else{
        fs.readdir("./views/user/"+req.cookies.user,(err,files)=>{
            if(err) throw err;
            else{
                var len=files.length;
                var textcontent="";
                if(len>0){
                    if(len>20) var len=20;
                    for(var i=0;i<len;i++){
                        textcontent=fs.readFileSync("./views/user/"+req.cookies.user+"/"+files[i]);
                        if(textcontent.length>400){
                            blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent.slice(0,400)+"...</p><a style='align-self:flex-end;' href='/openblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Read more...</a></div>"
                        }
                        else{
                            blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent+"...</p><a style='align-self:flex-end;' href='/openblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Read more...</a></div>"
                        }
                    }
                }
            }
            res.render("login.ejs",{user: req.cookies.user, blog: blogcontent});
        });
    }
});

server.get("/create",(req,res)=>{
    res.render("create.ejs",req.cookies);
})

server.post("/save",upload.single("image"),(req,res,next)=>{
    if(fs.existsSync("./views/user/"+req.cookies.user+"/"+req.body.title+".txt")){
        const files =fs.readdirSync("./views/user/"+req.cookies.user);
        var rnd=Math.floor(Math.random()*1000);
        if(fs.existsSync("./views/user/image")){
            if(fs.existsSync("./public/images/"+req.cookies.user+"/"+req.body.title+files.length+rnd+".jpg"))
                fs.rmSync("./public/images/"+req.cookies.user+"/"+req.body.title+files.length+rnd+".jpg");
            fs.copyFileSync("./views/user/image","./public/images/"+req.cookies.user+"/"+req.body.title+files.length+rnd+".jpg");
            fs.rmSync("./views/user/image");
        }
        //fs.writeFileSync("./views/user/"+req.cookies.user+"/"+req.body.title+files.length+rnd+".jpg",req.file.buffer);
        //console.log("./views/user/"+req.cookies.user+"/"+req.body.title+files.length+Math.floor(Math.random()*1000));
        fs.writeFileSync("./views/user/"+req.cookies.user+"/"+req.body.title+files.length+rnd+".txt",req.body.content.replaceAll("<","("));
    }
    else{  
        
        if(fs.existsSync("./views/user/image")){
            if(fs.existsSync("./public/images/"+req.cookies.user+"/"+req.body.title+".jpg"))
                fs.rmSync("./public/images/"+req.cookies.user+"/"+req.body.title+".jpg");
            fs.copyFileSync("./views/user/image","./public/images/"+req.cookies.user+"/"+req.body.title+".jpg");
            fs.rmSync("./views/user/image");
        }
        //fs.writeFileSync("./views/user/"+req.cookies.user+"/"+req.body.title+".jpg",req.file.buffer);
        fs.writeFileSync("./views/user/"+req.cookies.user+"/"+req.body.title+".txt",req.body.content.replaceAll("<","("));
    }
    
    res.render("create.ejs",{user: req.cookies.user, isuploaded:true});

})

server.get("/blog.com",(req,res)=>{
    res.render("home.ejs");
});

server.get("/editdelete",(req,res)=>{
    res.cookie("user",req.cookies.user);
    var username=req.cookies.user;
    var blogcontent=vieweditdelete(username);
    res.render("login.ejs",{user: req.cookies.user, blog: blogcontent});
});

function vieweditdelete(user){
    var blogcontent="";
    const files =fs.readdirSync("./views/user/"+user);
    var len=files.length;
    var textcontent="";
            if(len>0){
                if(len>30) len=30;
                for(var i=0;i<len;i++){
                    textcontent=fs.readFileSync("./views/user/"+user+"/"+files[i]);
                    if(textcontent.length>400){
                        blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent.slice(0,400)+"...</p><div style='align-self:flex-end;'><a href='/editblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Edit&nbsp;&nbsp;&nbsp;&nbsp;</a><a href='/deleteblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Delete&nbsp;&nbsp;&nbsp;&nbsp;</a></div></div>"
                    }
                    else{
                        blogcontent=blogcontent+"<div class='blogcontent'><h2>"+files[i].slice(0,files[i].length-4)+"</h2><p style='text-align: justify;word-break: break-all;'>"+textcontent+"...</p><div style='align-self:flex-end;'><a href='/editblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Edit&nbsp;&nbsp;&nbsp;&nbsp;</a><a href='/deleteblog?filename="+files[i].slice(0,files[i].length-4).replaceAll(" ","+")+"'>Delete&nbsp;&nbsp;&nbsp;&nbsp;</a></div></div>"
                    }
                }
            }
    return blogcontent;
}

server.get("/editblog",(req,res)=>{
    //res.cookie("user",req.cookies.user);
    if(req.cookies.user===undefined){
    res.render("home.ejs");
    }
    var filename=req.query.filename.replaceAll("+"," ");
    var textcontent=fs.readFileSync("./views/user/"+req.cookies.user+"/"+filename+".txt");
    res.render("editblog.ejs",{user: req.cookies.user,title:filename, blog: textcontent});
});

server.get("/deleteblog",(req,res)=>{
    fs.rmSync("./views/user/"+req.cookies.user+"/"+req.query.filename.replaceAll("+"," ")+".txt");

    var blogcontent=vieweditdelete(req.cookies.user);
    res.render("login.ejs",{user: req.cookies.user, blog: blogcontent});
});

server.post("/editsave",upload.single("image"),(req,res)=>{

    if(fs.existsSync("./views/user/image")){
        if(fs.existsSync("./public/images/"+req.cookies.user+"/"+req.body.title+".jpg"))
            fs.rmSync("./public/images/"+req.cookies.user+"/"+req.body.title+".jpg");
        fs.copyFileSync("./views/user/image","./public/images/"+req.cookies.user+"/"+req.body.title+".jpg");
        fs.rmSync("./views/user/image");
    }

    fs.rmSync("./views/user/"+req.cookies.user+"/"+req.body.title+".txt");
 
    fs.writeFileSync("./views/user/"+req.cookies.user+"/"+req.body.title+".txt",req.body.content.replaceAll("<","("));

    var blogcontent=vieweditdelete(req.cookies.user);
    res.render("login.ejs",{user: req.cookies.user, blog: blogcontent});

});

server.get("/openblog",(req,res)=>{
    if(req.query.filename===undefined){

        var folders= fs.readdirSync("./views/user/");
        var fileList=[];

        for(var i=0;i<folders.length;i++){
            const files=fs.readdirSync("./views/user/"+folders[i].toString());
            fileList[i]=new Array(files.length);
            for(var j=0;j<files.length;j++){
                fileList[i][j]=files[j].toString().slice(0,files[j].toString().length-4);
            }
        }
        
        res.render("read.ejs",{user: req.cookies.user, blog: " ", fileLists:fileList});
    }

    else{

        if(req.query.user===undefined){
            var textcontent=fs.readFileSync("./views/user/"+req.cookies.user+"/"+req.query.filename+".txt");
            if(fs.existsSync("./public/images/"+req.cookies.user+"/"+req.query.filename+".jpg")){    
            textcontent="<h2>"+req.query.filename.replaceAll("+"," ")+"<br/></h2><div><img  style='float:left; height:200px;padding-top: 10px;padding-right: 10px;' src='"+"./images/"+req.cookies.user+"/"+req.query.filename+".jpg"+"'/><p style='text-align:justify;word-break:break-all;'>"+textcontent+"</p></div>";
            }
            else
            textcontent="<h2>"+req.query.filename.replaceAll("+"," ")+"<br/></h2><p style='text-align:justify;word-break:break-all;'>"+textcontent+"</p>";
    
            var folders= fs.readdirSync("./views/user/");
            var fileList=[];

            for(var i=0;i<folders.length;i++){
                const files=fs.readdirSync("./views/user/"+folders[i].toString());
                fileList[i]=new Array(files.length);
                for(var j=0;j<files.length;j++){
                    fileList[i][j]=files[j].toString().slice(0,files[j].toString().length-4);
                }
            }

            res.render("read.ejs",{user: req.cookies.user, blog: textcontent, fileLists:fileList});
        }else{

            var folders= fs.readdirSync("./views/user/");
            var fileList=[];
            var textcontent=fs.readFileSync("./views/user/"+folders[req.query.user]+"/"+req.query.filename+".txt");
            
            if(fs.existsSync("./public/images/"+folders[req.query.user]+"/"+req.query.filename+".jpg")){    
                textcontent="<h2>"+req.query.filename.replaceAll("+"," ")+"<br/></h2><div><img style='float:left; height:200px;padding-top: 10px;padding-right: 10px;' src='"+"./images/"+folders[req.query.user]+"/"+req.query.filename+".jpg"+"'/><p style='text-align:justify;word-break:break-all;'>"+textcontent+"</p></div>";
                }
                else
                textcontent="<h2>"+req.query.filename.replaceAll("+"," ")+"<br/></h2><p style='text-align:justify;word-break:break-all;'>"+textcontent+"</p>";
        
            for(var i=0;i<folders.length;i++){
                const files=fs.readdirSync("./views/user/"+folders[i].toString());
                fileList[i]=new Array(files.length);
                for(var j=0;j<files.length;j++){
                    fileList[i][j]=files[j].toString().slice(0,files[j].toString().length-4);
                }
            }

            res.render("read.ejs",{user: req.cookies.user, blog: textcontent, fileLists:fileList});
        }
    }
});