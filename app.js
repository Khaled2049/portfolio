const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/blogs", { useNewUrlParser: true});  

const blogSchema = new mongoose.Schema ({
    name: String, 
    content: String,  
})

const peopleSchema = new mongoose.Schema ({
    name: String,
    message: String,
})

const Person = mongoose.model("People", peopleSchema);

const Blog = mongoose.model("Blog", blogSchema);

const blog = new Blog({
    name: "First Blog",
    content: "This is a test"
})

const person = new Person({
    name: "Shoibal",
    message: "I think you are really cool!"
})

// blog.save();
// person.save();

Blog.find(function(err, blogs) {
    if(err) {
        console.log(err);
    } else {
        console.log(blogs);
    }
})


Blog.find(function(err, blogs) {
    if(err) {
        console.log(err);
    }
    else {
        blogs.forEach((blog) => {
            console.log(blog.name);
        })
    }
    mongoose.connection.close();
})
