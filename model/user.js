const { application } = require('express');
const mongoose = require('mongoose');
const long = require('mongoose-long')(mongoose);
const Schema= mongoose.Schema;
const userSchema = new Schema({
    username : String,
    password : String ,
    dateOfBirth : Date

},{
    collection:'user'
});
const userModel = mongoose.model('user',userSchema)

module.exports=userModel