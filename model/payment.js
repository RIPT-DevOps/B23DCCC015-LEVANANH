const { application } = require('express');
const mongoose=require("mongoose");
const Schema= mongoose.Schema;
const paymentSchema=new Schema({
    cartId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart', 
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    product:[{ type: Schema.Types.ObjectId, ref: 'products' }],
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'products' },
        productName: { type: String },
        quantity: { type: Number, required: true }
    }],
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    status:{
        defaul:"chưa xác nhận",
        type:String
    },
    method:{
        type:String,
    }
},{
    collection:"payment"
})
const paymentModel=mongoose.model("payment",paymentSchema)
module.exports=paymentModel