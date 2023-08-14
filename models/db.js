const mongoose = require("mongoose");

module.exports.init = async function(){
    await mongoose.connect("mongodb+srv://app:IczvDAgKIdi34tmq@cluster0.myvgvli.mongodb.net/Mydatabase?retryWrites=true&w=majority");
    console.log("Connected to database");
};