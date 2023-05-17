const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to the MongoDB database');
}).catch((err) => {
  console.error('Error connecting to the MongoDB database', err);
});

// Create a mongoose schema for a User
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// Create a mongoose model for a User using the userSchema
const User = mongoose.model('User', userSchema);

// Create a new user and save it to the database
const newUser = new User({
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30
});
newUser.save().then(() => {
  console.log('New user saved to the database');
}).catch((err) => {
  console.error('Error saving new user to the database', err);
});

// Define a route that returns all users from the database
app.get('/users', (req, res) => {
  User.find().then((users) => {
    res.json(users);
  }).catch((err) => {
    console.error('Error getting users from the database', err);
    res.status(500).json({ error: 'Error getting users from the database' });
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
