const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoos = require('mongoos');
const cors = require('cors');
const PORT = 4000; 
const mongodbPort = 27019; // the port that your mongodb server instance 
// is listening in on

let Todo = require('./todo.model');

// Express is a fast and lightweight web framework for Node.js
// Express is the essential part of the MERN stack 

// body-parser is the Node.js body parsing middleware 

// cors = cross-origin resource sharing and basically allows
// restricted resources on a web page to be requesed from 
// another domain from which the first resource was served

// Mongoos is a Node.js framework which lets us access MongoDB in an object-oriented way.
mongoose.connect('mongodb://127.0.0.1:${mongodbPort}/todos', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

const Schema = mongoose.Schema; // schema of the database we connected to at endpoint 

let Todo = new Schema({
    todo_description: {
        type: String
    },
    todo_responsible: {
        type: String
    },
    todo_priority: {
        type: String
    },
    todo_completed: {
        type: Boolean
    }
});

// A Mongoos model is a wrapper of the Mongoose Schema 
// A Mongoose schema defines the structure of the document, default values, validators, etc., 
// whereas a Mongoose model provides an interface to the database for creating, querying, updating, deleting records, etc.

module.exports = mongoose.model('Todo', Todo); // defines that here we 
// export Todo Model out

const todoRoutes = express.Router(); // defines the Router from Express
// what is an Express Router? 
// A router is an object that is used to 
// literally route client requests to a certain endpoint 

app.use(cors());
app.use(bodyParser.json()); 

app.use('/todos', todoRoutes); // define todoRoutes as a router for endpoint localhost:4000/todos

// and then we start with the routing, below we define how to route (handle) GET requests at endpoint /todos

// this router function handles a GET method to endpoint .../, 
// basically GETs all todo list items by scanning the database
todoRoutes.route('/').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});

// this router function handles GET requests to endpoint ../:id
todoRoutes.route('/id').get(function(req, res) {
    let id = req.params.id; // val or immutable variable id
    Todo.findById(id, function(err, todo) { // note findById, and find are Model methods
        res.json(todo); // find todo list items by id, and return as JSON object
    });
});

// this router function handles POST requests at endpoint ../add 

todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

// this router function handles POST requests to update a todo item 
// with id at endpoint ../update/:id
todoRoutes.route('/update/:id').post(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;
            todo.save().then(todo => {
                res.json('Todo updated!'); // save via Model object
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});


app.listen(PORT, function() {
	console.log("Server is running on Port: " + PORT);
});
