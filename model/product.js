const { application } = require('express');
const mongoose = require('mongoose');

const Schema= mongoose.Schema;
const productSchema= new Schema({
    image:String,
    name:String,
    thuonghieu: String,
    price:Number,
    category: String,
    thongso: {
        thongso1 : String,
        thongso2 : String ,
        thongso3 : String,
        thongso4 : String,
        thongsoA : String,
        thongsoB : String,
        thongsoC : String,
        thongsoD : String,
        thongsoE : String,
        thongsoF : String,
    }
},{
    collection:'products'
})
const productModel= mongoose.model('products',productSchema);

module.exports=productModel