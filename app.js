const express = require("express");
const fs = require("fs");
const multer = require("multer");
const app = express();
const upload = multer({ dest: 'uploads/' })
var session = require("express-session");
const db = require("./models/db");
const UserModel = require("./models/User");
const ProductModel = require("./models/products");
// const mail = require("./utils/sendverifymail")
//-------------------middleware----------------------------
app.set("view engine", "ejs")
app.use(express.static("assets"))
app.use((request, response, next) => {
  console.log(request.method, request.url);
  next();
})
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(session({
  secret: 'This is a secure key',
  resave: true,
  saveUninitialized: true,
}))
app.use(upload.single("productImage")); 

//----------------------html--------------------------
app.get("/",function (request, response) {
  if (!request.session.isLoggedin) {
    response.render("index", { username: null })
    return;
  }
  else{
    if(request.session.isAdmin){
    response.render("admin", { username: request.session.username})
    return;
    }
    response.render("product", { username: request.session.username})
  }
})

app.get("/login", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/")
    return
  }
  response.render("login", { error: null })
})
app.get("/signup", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/")
    return;
  }
  response.render("signup", { error: null })
})
app.get("/add-product", function (request, response) {
  if (!request.session.isLoggedin) {
    response.redirect("index")
    return;
  }
  else{
    if(request.session.isAdmin){
    response.render("add-products", { username: request.session.username,error:null})
    return;
    }
    response.render("404")
  }
})
app.get("/contact", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("contact", { username: request.session.username })
    return;
  }
  response.redirect("/")
});
app.get("/changepass", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("changepass", { username: request.session.username,message:null })
    return;
  }
  response.redirect("/")
});
app.get("/user", function (req, response) {
  const user = req.session.username;
  response.status(200);
  response.json(user);
});
app.get("/logout", function (request, response) {
  if (request.session.isLoggedin) {
    request.session.destroy(function (error) {
      if (error) {
        response.status(500)
        response.send("Something went wrong please try later")
      }
      else {
        response.render("logout")
      }
    })
    return;
  }
  response.redirect("/login")
});
//--------------------------------------------------------------------------
app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;
  UserModel.findOne({username:username}).then(function(user){
    if(!user){
      response.render("login", { error: "Invalid username or password" })
    }
    else{
      if(user.password === password){
        request.session.isLoggedin = true;
        request.session.username = username;

        if(user.isAdmin === true){
          request.session.isAdmin = true;
        }
        response.redirect("/")
      }
      else{
        response.render("login", { error: "Invalid username or password" })
      }
    }
  })
  .catch(function(error){
    response.render("login", { error: error});
  })
})
//-------------------------------------------------------------------------------
app.post("/signup", function (request, response) {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  UserModel.findOne({ username: username }).then(function (user) {
    if (user) {
      response.render("signup", { error: "Username is already used" })
    }
    else{
      UserModel.findOne({ email: email }).then(async function (user) {
        if (user) {
          response.render("signup", { error: "Email is already used" })
        }
        else{
          let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!regex.test(password)){
            response.render("signup", { error: "Password must be strong" })
            return
          }
          let user = { username: username,  email: email,  password: password }
          UserModel.create(user).then(function(user){
          response.redirect("login");
          // const ab = mail.sendverifymail(
          //   [{
          //       Email:"varun1220328@jmit.ac.in",
          //       Name:"Varun Bansal"
          //     }],
          //   "Verification Mail",
          //   "Please verify your account"
          // );
          // // console.log(ab)
        })
        }
      })
    }
  })
  .catch(function(error){
    response.render("signup", { error: error});
  })
})
//------------------------------------------------------------------------------------
app.post("/add-product",function(request,response){
  const productImageName = request.file
  const product = {
    productName:request.body.productName,
    productPrice:request.body.productPrice,
    quantity:request.body.quantity,
    productImage:productImageName.filename,
    productDesc:request.body.productDesc,
  }
  ProductModel.create(product).then(function(product){
    response.redirect("/add-product")
  })
  .catch(function(error){
    response.render("add-products", { username:request.session.username,error: "Something Went wrong, please try later"});
  })
})
//---------------------------------------------------------------------------
app.get("/get-products",async function(request,response){
  let count = await request.query.count

  ProductModel.find().skip(Number(count)).limit(Number(count)+5).then(function(data){
    if(data){
      response.status(200)
      response.json(data)
    }
    else{
      response.status(500)
      response.json("something went wrong in database")
    }
  })
  .catch(function(error){
    response.render("404")
  })
    
  

})
//---------------------------------------------------------------------
app.get("/details",function(request,response){
  const data = request.query.name 
  response.render("details",{username:request.session.username,data:data})
  response.status(200)
})
//-----------------------------------------------------------------------------
app.post("/changepass",async function(request,response){
  const oldpass = request.body.oldpass
  const newpass = request.body.newpass
  const confirmpass = request.body.confirmpass
  await UserModel.findOne({username:request.session.username}).then(function(user){
    if(user.password === oldpass){
      if(oldpass === newpass){
        response.render("changepass", { username: request.session.username,message:"new password must be different from old password"})
        return
      }
      let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regex.test(newpass)){
        response.render("changepass", { username: request.session.username,message:"new password must be strong"})
        return
      }
      if(newpass !== confirmpass){
        response.render("changepass", { username: request.session.username,message:"new password and confirm password didn't match"})
        return
      }
      UserModel.findOneAndUpdate(user,{password:newpass}).then(function(){  
        response.render("changepass", { username: request.session.username,message:"password updated successfully"})
      })
    }
    else{
      response.render("changepass", { username: request.session.username,message:"Wrong old password"})
      return
    }
  })
  .catch(function(error){
    response.render("404")
  })
})
//------------------------------------------------------------------------
app.get("*", function (request, response) {
  response.render("404")
})
db.init().then(function () {
  app.listen(8000, function () {
    console.log("Server is running successfully on port 8000");
  })
});
