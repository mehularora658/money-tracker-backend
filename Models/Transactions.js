const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    name:{type:String,required:true},
    price:{type:Number,required:true},
    description:{type:String,required:true},
    datetime:{type:Date,required:true},
    label:{type:String,required:true},
    userId:{type:String,required:true},
    transactionType:{type:String,required:true}
})

const transactionModel = mongoose.model('Transaction',transactionSchema)

module.exports = transactionModel