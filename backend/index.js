require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const AWS = require('aws-sdk');
const multer = require("multer");
const multerS3 = require('multer-s3');
const cors = require('cors');
const path = require('path');
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// image storage engine

/*Initialize S3 client*/
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/* multer with s3*/

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = `images/${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, filename);
    }
  })
});

// Creating upload Endpoint for 


app.post('/upload', (req, res) => {
  app.post('/upload', (req, res) => {
  upload.single('product')(req, res, err => {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: 0, error: err.message });
      }
      return res.status(500).json({ success: 0, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: 0, error: 'No file uploaded' });
    }
    res.json({ success: 1, image_url: req.file.location });
  });
});
});


// Serve images from S3
app.get('/images/:key(*)', (req, res) => {
  const key = req.params[0]; // wildcard catch-all
  const params = { Bucket: process.env.S3_BUCKET_NAME, Key: key };
  const stream = s3.getObject(params).createReadStream();
  stream.on('error', err => {
    console.error('S3 stream error:', err);
    res.status(404).send('Image not found');
  });
  stream.pipe(res);
});


// Databas connection with mongodb

const conn = mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

// Api creation

app.get('/',(req,res)=>{
    res.send("Express is running")
})

// Schema for crating products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true
    }
});

app.post('/addproduct',async(req,res)=>{

    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }else{
        id=1;
    }

    const product =new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    await product.save();
    res.json({
        success:true,
        name:req.body.name,
    });
})

// creating api for delete product
app.delete("/removeproduct/:id",async(req,res)=>{
    let {id} = req.params;
    id = Number(id);
    await Product.findOneAndDelete({id});
    res.json({
        success:true,
        message:`Product ${id} deleted successfully.`
    });
});


// Creat api for getting all products

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    res.send(products);
});

// Schema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String
    },
    cartData:{
        type:Object
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating Endpoint for resgistering user

app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({sucess:false,errors:"existing user found with same email address"});
    }
    let cart = {};
    for (let i=0;i<300;i++){
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    });

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,JWT_SECRET);
    res.json({success:true,token});

})

// creating endpoint for user login

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,JWT_SECRET);
            res.json({success:true,token});
        }else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }else{
        res.json({success:false,errors:"Wrong Email-id"});
    }
})

// creating endpoint for new collection data
app.get('/newcollection',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
})

// creating endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    res.send(popular_in_women);
})

// creating middleware to fetch user

const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"});
    }else{
        try{
            const data = jwt.verify(token,JWT_SECRET);
            req.user=data.user;
            next();
        }catch(error){
            res.static(401).send({errors:"please authenticate using a valid token"})
        }
    }
}

// creating endpoint for adding products in cartData
app.post('/addtocart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

// creating endpoint to remove product from cartData
app.post('/removefromcart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

// creating endpoint to get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})
// error handling middleware
// app.use((err, req, res, next) => {
//     console.error('Unhandled error:', err);
    
//     // Send JSON error response instead of HTML
//     res.status(500).json({
//         success: 0,
//         error: 'Internal server error',
//         message: err.message
//     });
// });


app.listen(port,(err)=>{
    if(!err){
        console.log('Server is running on Port : '+port);
    }else{
        console.log("Error : ",{err});
    }
})
