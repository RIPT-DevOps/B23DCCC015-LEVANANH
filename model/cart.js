const { application } = require('express');
const mongoose=require('mongoose');
const Schema= mongoose.Schema;
const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', 
            required: true
        },
        quantity: {
            type: Number,
            require:true,
            default: 1
        }
    }]
},{
    collection:'cart',
    
});
const cartModel = mongoose.model('cart',cartSchema);

module.exports=cartModel
