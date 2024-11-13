const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type:String
  },
  username: {
    type: String,
    unique:true
  },
  bio: {
    type: String
  },
  img:{
    type: String
  },
  email:{
    type:String,
    unique:true
  },
  following:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
  },
  followers:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[]
  },
  liked:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[]
  },
  password:{
    type:String
  },
  bookmarks:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[]
  }
});



const User = mongoose.model("User", userSchema);


module.exports = { User };