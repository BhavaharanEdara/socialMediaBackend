const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
dotenv.config()

const { initializeDatabase } = require("./db/db.connect");
const {User} = require("./models/user.model")
const {Post} = require("./models/post.model")

app.use(cors());
app.use(express.json());

initializeDatabase();

const verifyJwt = async(req, res, next) => {

  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "No token found" });
  }
  try {
    const decodedToken = await jwt.verify(token,process.env.JWT_SECRET)
    req.user = decodedToken
    next()
  } catch (error) {
    console.log(error);
    res.status(402).json({error:"invalid token", err:error});
  }
};
const getAllUsers = async()=>{
  try{
    const users = await User.find();
    return users
  }
  catch(error){
    console.log(error);
  }
}

const getUserById = async(id)=>{
  try{
    const users = await User.findById(id);
    return users
  }
  catch(error){
    console.log(error);
  }
}

const createNewUser = async(data)=>{
  try{
    const newUser = new User(data);
    const savedUser = await newUser.save();
    return savedUser
  }
  catch(error){
    console.log(error);
  }
}

const getUserByEmail = async(email)=>{
  try{
    const user = await User.findOne({email:email});
    return user
  }
  catch(error){
    console.log(error);
  }
}

const updateUser = async(id, data)=>{
  try{
    const user = await User.findByIdAndUpdate(id, data, {new: true})
    return user
  }
  catch(error){
    console.log(error)
  }

}

app.get("/users", async (req,res)=>{
  try{
    const users = await getAllUsers();
    if(users.length!=0){
      res.status(200).send(users)
    }
    else{
      res.status(404).json({error: "No user found"})
    }
  }
  catch(error){
    res.status(400).json({error: "Failed to fetch users"})
  }
})

app.get("/users/:id", async (req,res)=>{
  try{
    const user = await getUserById(req.params.id);
    if(user){
      res.status(200).send(user)
    }
    else{
      res.status(404).json({error: "User not found"})
    }
  }
  catch(error){
    res.status(400).json({error: "Failed to fetch user data"})
  }
})

app.post("/users", async (req,res)=>{
  try{
    const newUser = await createNewUser(req.body);
    res.send(newUser)
  }
  catch(error){
    res.status(400).json({error: "Failed to add users"})
  }
})

const addLikedPost = async(userId, postId)=>{
  try{
    const user = await User.findById(userId);
    user.liked.push(postId);
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }
}

app.put("/users/add_liked_post/:id", verifyJwt, async(req,res)=>{
  let id = req.body.id
  try{
    const user = await addLikedPost(req.params.id, id);
    res.send(user);
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }
})

const removeLikedPost = async(userId,id)=>{
  try{
    const user = await User.findById(userId);
    user.liked = user.liked.filter(postId=>postId!=id);
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }

}


app.put("/users/remove_liked_post/:id", verifyJwt, async(req,res)=>{
  let id = req.body.id
  try{
    const user = await removeLikedPost(req.params.id, id);
    res.send(user);
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }
})

const addBookMark = async(userId, id)=>{
  try{
    const user = await User.findById(userId);
    user.bookmarks.push(id);
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }
}
app.put("/users/add_book_mark/:id", verifyJwt, async(req,res)=>{
  let id = req.body.id
  try{
    const user = await addBookMark(req.params.id, id);
    res.send(user);
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }

})


const removeBookMark = async(userId, id)=>{
  try{
    const user = await User.findById(userId);
    user.bookmarks = user.bookmarks.filter(postId=>postId!=id);
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }
}

app.put("/users/remove_book_mark/:id", verifyJwt, async(req,res)=>{
  let id = req.body.id
  try{
    const user = await removeBookMark(req.params.id, id);
    res.send(user);
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }

})

const followUser = async( userId, followId)=>{
  try{
    const user = await User.findById(userId);
    const secondUser = await User.findById(followId);
    secondUser.followers.push(userId);
    user.following.push(followId);
    await secondUser.save()
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }
}

const unfollowUser = async( userId, followId)=>{
  try{
    const user = await User.findById(userId);
    const secondUser = await User.findById(followId);
    secondUser.followers = secondUser.followers.filter(id=>id!=userId);
    user.following = user.following.filter(id=>id!=followId);
    await secondUser.save()
    const updatedUser = await user.save();
    return updatedUser
  }
  catch(error){
    console.log(error);
  }
}

app.put("/users/follow_user/:id", verifyJwt,async(req,res)=>{
  let id = req.body.id
  try{
    const user = await followUser(req.params.id, id);
    res.send(user);
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }

})

app.put("/users/unfollow_user/:id", verifyJwt,async(req,res)=>{
  let id = req.body.id
  try{
    const user = await unfollowUser(req.params.id, id);
    res.send(user)
  }
  catch(error){
    res.status(400).json({error: "Failed to add liked post"})
  }

})

app.put("/users/:id", verifyJwt,async(req,res)=>{
  try{
    const updatedUser = await updateUser(req.params.id,req.body);
    res.send(updatedUser)
  }
  catch(error){
    res.status(400).json({error: "Failed to add users"})
  }
})




app.post("/login", async(req,res)=>{
  try{
    const user = await getUserByEmail(req.body.email);
    if(user && user.password===req.body.password){
      const { password } = req.body;
      delete req.body.password;
      const secret = process.env.JWT_SECRET
      const token = jwt.sign(user.toObject(), secret, { expiresIn: "24h" });
      res.send({user, token});
    }
    else{
      res.status(400).send({error: "Incorrect Email or Password"})
    }
  }
  catch(error){
    res.status(400).json({error: "Failed to login"})
  }
})

const getAllPosts = async()=>{
  try{
    const posts = await Post.find();
    return posts;
  }
  catch(error){
    console.log(error);
  }
}

const addPost = async(data)=>{
  try{
    const newPost = new Post(data);
    const savedPost = await newPost.save();
    return savedPost;
  }
  catch(error){
    console.log(error);
  }
}
app.get("/posts", async(req,res)=>{
  try{
    const posts = await getAllPosts();
    res.send(posts);
  }
  catch(error){
    res.status(400).json({error:"Failed to fetch posts"})
  }
})

app.post("/posts", async(req,res)=>{
  try{
    const post = await addPost(req.body);
    res.send(post);
  }
  catch(error){       
    res.status(400).json({error:"Failed to add posts"})
  }
})

const getPostById = async(id)=>{
  try{
    const post = await Post.findById(id);
    return post;
  }
  catch(error){
    console.log(error);
  }
}

app.get("/posts/:id", async(req,res)=>{
  try{
    const post = await getPostById(req.params.id);
    res.send(post);
  }
  catch(error){
    res.status(400).json({error:"Failed to fetch post"})
  }
})

const updatePost = async(id, data)=>{
  try{
    const post = await Post.findByIdAndUpdate(id, data, {new:true});
    return post;
  }
  catch(error){
    console.log(error)
  }
}
app.put("/posts/edit/:id",verifyJwt, async(req,res)=>{
  try{
    const updatedPost = await updatePost(req.params.id, req.body);
    res.send(updatedPost)
  }
  catch(error){
    res.status(400).json({error:"Failed to update post"})

  }
})

app.put("/posts/like/:id",verifyJwt,async(req,res)=>{
  try{
    const updatedPost = await updatePost(req.params.id, req.body);
    res.send(updatedPost)
  }
  catch(error){
    res.status(400).json({error:"Failed to update post"})
  }
})

app.put("/posts/dislike/:id",verifyJwt,async(req,res)=>{
  try{
    const updatedPost = await updatePost(req.params.id, req.body);
    res.send(updatedPost)
  }
  catch(error){
    res.status(400).json({error:"Failed to update post"})
  }
})

const deletePost = async(id)=>{
  try{
    const post = await Post.findByIdAndDelete(id);
    return post
  }
  catch(error){
    console.log(error);
  }
}

app.delete("/post/:id", verifyJwt,async(req,res)=>{
  try{
    const deletedPost = await deletePost(req.params.id);
    res.send(deletedPost)
  }
  catch(error){
    res.status(400).json({error:"Failed to delete post"})
  }
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
