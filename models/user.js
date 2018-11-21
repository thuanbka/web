var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
    phone:{
        type: String,
        unique:true
    },
    email:{
       type:String,
    },
    pass:{
        type: String
    },
    name:{
        type :String
    },
    time:{
        type:Date
    },
    avata:{
        type :String
    },
    order:{
        type:Array
    },
    neworder:{
        type:Array
    },
    status:{
        type:Number
    },
    rate:{
        type:Array
    },
    rate_level1:{
        type:Array
    },
    like:{
        type:Array
    },
    dislike:{
        type:Array
    },
    auth:{
        type:Number
    }

});

userSchema.methods.generateHash = function(pass){
    return bcrypt.hashSync(pass,bcrypt.genSaltSync(8),null);
};
userSchema.methods.validPassword = function(pass){
    return bcrypt.compareSync(pass, this.pass);
};
module.exports = mongoose.model('user',userSchema); 