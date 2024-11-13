const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type:String
  },
  description:{
    type:String
  },
  likes:{
    type:Number,
    default:0
  },
  dislikes:{
    type:Number,
    default:0
  },
comments:{
    type:[String],
    default:[]
  },
  postedBy:{
    type: mongoose.Schema.Types.ObjectId
  },
  
}, { timestamps: true });

const Post = mongoose.model("post", postSchema);


module.exports = { Post };