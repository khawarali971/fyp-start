var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs')
var userSchema = new Schema({
    

    fname: {type: String, required: true},
email: {type: String, required: true},
lname: {type: String, required: true},
password: {type: String, required: true},
blood: {type: String},
DOB: {type: String},
gender: {type: String},
cnic: {type: String},
address: {type: String},
city: {type: String},
province: {type: String},
pic: {type: String},
phone: {type: String}

})
userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}
module.exports = mongoose.model('User', userSchema);