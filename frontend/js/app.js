const API_URL = "https://blog-app-zgxk.onrender.com";

async function createBlog(){

const title = document.getElementById("title").value
const content = document.getElementById("content").value

await fetch(API_URL + "/posts",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
title:title,
content:content
})
})

document.getElementById("title").value=""
document.getElementById("content").value=""

loadBlogs()

}



async function loadBlogs(){

const res = await fetch(API_URL + "/posts")
const blogs = await res.json()

let html=""

blogs.forEach(b=>{

html += `
<div class="blog-card">

<h3>${b.title}</h3>

<small>Posted on ${new Date(b.createdAt).toLocaleDateString()}</small>

<p>${b.content}</p>

<div class="actions">

<button onclick="editBlog('${b._id}','${b.title}','${b.content}')">
Edit
</button>

<button onclick="deleteBlog('${b._id}')">
Delete
</button>

</div>

</div>
`
})

document.getElementById("blogs").innerHTML = html

}



async function deleteBlog(id){

await fetch(API_URL + "/posts/"+id,{
method:"DELETE"
})

loadBlogs()

}



async function editBlog(id,title,content){

const newTitle = prompt("Edit title",title)
const newContent = prompt("Edit content",content)

await fetch(API_URL + "/posts/"+id,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
title:newTitle,
content:newContent
})
})

loadBlogs()

}