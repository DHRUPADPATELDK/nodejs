const express = require('express');
const router = express.Router();
const nodemailer=require('nodemailer')

const authenticate =require ("../middleware/authenticate")

const bcrypt =require('bcryptjs') 
const jwt = require('jsonwebtoken')

require('../db/conn')
const User =require("../model/userSchema");
const { response } = require('express');

router.get('/', (req, res) => {
    res.send(`Hello world from the server router js`);
});



router.post('/register', async(req, res) => {

    const {name,email,phone,work,password,cpassword} =req.body;
  
    if( !name || !email || !phone || !work || !password || !cpassword){
       return res.status(422).json({ error :"plz filled the filed properly "});
    }

    try {

      const userExist= await User.findOne({email:email});
    
      if(userExist){

        return res.status(422).json({ error :"email id all  "});

       }else if(password != cpassword){

        return res.status(422).json({ error :"pass and cpass not match  "});

       }else{

        const user =new User(req.body)


        const userRegister =  await user.save();


        ////////////
          // gmail send the data 
          let smtpTransport=nodemailer.createTransport({
            service:'gmail',
            port:465,
            auth:{
                user:'enter your email id',
                pass:'enter your password '
            }
        })   

        let mailOPtions ={
           from:'dhrupad1912@gmail.com',
           to: "dhrupad1912@gmail.com", 
           subject: "Hello ✔",
           html: `
           <h1>information</h1>
           <ul>
           <li> ${name}  </li>
           <li> ${email}  </li>
           <li> ${phone}  </li>
           <li> ${work}  </li>
           </ul>
           `
        }
      
        smtpTransport.sendMail(mailOPtions,(error,response)=>{
            if (error) {
                res.send(error)
            } else {
                res.send('success')
            }
        })
    smtpTransport.close(); //
    
    ///////////

        if(userRegister){
          res.status(201).json({ Message :"user register suc  "});
         }

       }
    } catch (err) {
        console.log(err)
    }

  

});


//login router

router.post('/signin',async(req,res)=>{
    try {

        let token;
        const {email,password} =req.body;

        if( !email  || !password ){
        return res.status(400).json({ error :"plz filed data "});
        }

        const userLogin = await User.findOne({email:email})   // check email

        if(userLogin){
          
           // jwt
            
            token  =  await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtToken",token,{
                    expires:new Date(Date.now()+25892000000),
                    httpOnly:true
            });
           
              

         // pass match
         const isMatch = await bcrypt.compare(password,userLogin.password)   

            if (!isMatch) {
                res.status(400).json({ error :"user credentials "});
            } else {
                res.json({ Message :" user signing succ "});
            }
            
            
        }else{
        
            res.status(400).json({ error: "invalid credentials "})

        }

    } catch (err) {
        console.log(err)
    }
    
})


router.get('/about',authenticate, (req, res) => {
    console.log(`Hello my About`);
    res.send(req.rootUser);
});




router.get('/getdata',authenticate, (req, res) => {
    console.log(`Hello my About`);
    res.send(req.rootUser);
})

module.exports = router;





