const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    role:{
        type:String,
        required:[true,"role is required"],
        enum:['admin','organisation','user','hospital','donar']
    },
    name:{
        type:String,
        required: function() {
            if(this.role === 'user' || this.role === 'admin'){
                return true
            }
            return false
        }
    },
    organisationName:{
        type:String,
        required: function(){
            return this.role === 'organisation';
        },
        unique : true,
        sparse : true,
    },
    hospitalName:{
        type:String,
        required: function(){
            if(this.role === 'hospital'){
                return true
            }
            return false
        }
    },
    email:{
        type:String,
        required:[true, 'email is required'],
        unique:true
    },
    password:{
        type:String,
        required:[true ,'Password is required'],
    },
    website:{
        type:String
    },
    address:{
        type:String,
        required:[true,'address is required'],
    },
    phone: {
        type:String,
        required:[true,"phone number is required"],
    }
}, {timestamps : true});

module.exports = mongoose.model('users',userSchema)