const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_URL || "*"
}))

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// Blog Model
const Post = mongoose.model("Post",{
  title:String,
  content:String,
  createdAt:{
    type:Date,
    default:Date.now
  }
})


// GET all posts
app.get("/posts", async (req,res)=>{
  const posts = await Post.find()
  res.json(posts)
})


// CREATE post
app.post("/posts", async (req,res)=>{
  const post = new Post(req.body)
  await post.save()
  res.json(post)
})


// UPDATE post
app.put("/posts/:id", async (req,res)=>{

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new:true }
  )

  res.json(updatedPost)

})


// DELETE post
app.delete("/posts/:id", async (req,res)=>{

  await Post.findByIdAndDelete(req.params.id)

  res.json({message:"Post deleted"})

})


// Serve index.html
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"..","frontend","index.html"))
})


// Serve static files
app.use(express.static(path.join(__dirname,"..","frontend")))


// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})