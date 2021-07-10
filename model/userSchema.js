const mongooose = require('mongoose');

const bcrypt =require('bcryptjs')   // we are hashing  the pass
const jwt = require('jsonwebtoken')


const userSchema = new mongooose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
         type: String,
        required:true
    },
    phone: {
        type: Number,
        required:true
    },
    work: {
         type: String,
        required:true
    },
    password: {
         type: String,
        required:true
    },
    cpassword: {
         type: String,
        required:true
    },
    // token
   
    tokens:[
        {
            token:{
                type: String,
                required:true
            }
        }
    ]
        
        
    
})


// we are hashing  the pass

userSchema.pre('save',async function(next){

    if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password,12);
    this.cpassword =await bcrypt.hash(this.cpassword,12);
    }
    next();
})

// we are jwt token generateAuthToken

userSchema.methods.generateAuthToken = async function(){
    try {
        let token =jwt.sign({_id:this._id},process.env.SECRET_KEY)
        this.tokens =this.tokens.concat({token:token})
        await this.save();
        return token;
    } catch (err) {
        console.log(err)
    }
}

const User = mongooose.model('USER', userSchema);

module.exports = User;