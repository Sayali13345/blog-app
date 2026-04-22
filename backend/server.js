const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      "https://blog-app-six-jet.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now
    }
  },
  credentials: true
}))

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// User Model
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Blog Model
const Post = mongoose.model("Post", new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

// Auth Middleware
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// --- AUTH ROUTES ---
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username: user.username, id: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });
    
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });
    
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username: user.username, id: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- POST ROUTES ---


// GET all posts
app.get("/posts", async (req,res)=>{
  try {
    const posts = await Post.find().populate('author', 'username');
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// CREATE post
app.post("/posts", authenticateUser, async (req,res)=>{
  try {
    const post = new Post({ ...req.body, author: req.user.id });
    await post.save();
    const populatedPost = await post.populate('author', 'username');
    res.json(populatedPost)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// UPDATE post
app.put("/posts/:id", authenticateUser, async (req,res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(post.author.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();
    const populatedPost = await post.populate('author', 'username');
    res.json(populatedPost)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// DELETE post
app.delete("/posts/:id", authenticateUser, async (req,res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(post.author.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    await Post.findByIdAndDelete(req.params.id)
    res.json({message:"Post deleted"})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// Serve static files
app.use(express.static(path.join(__dirname,"..","frontend","dist")))

// Serve index.html (SPA fallback)
app.get("/{*splat}", (req,res)=>{
  res.sendFile(path.join(__dirname,"..","frontend","dist","index.html"))
})


// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})