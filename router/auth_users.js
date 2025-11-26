const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let user = users.filter((u) => {
    return u.username === username;
  });
  if (user.length > 0) {
    return false;
  }

  return true;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validuser = users.filter((u) => {
    return u.username === username && u.password === password;
  });
  if (validuser.length > 0) {
    return true;
  }
  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return req.status(400).json({ message: "Missing username or password" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      "access", // secret key
      { expiresIn: "1h" }
    );

    // Store JWT in session for stateful authentication
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({
      message: "Login successful",
    });
  } else {
    return res.status(403).json({ message: "Invalid login" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews object exists
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // retrieved from JWT middleware

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure book has a reviews object
  if (!book.reviews) {
    book.reviews = {};
  }

  // Check if this user has written a review
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review from this user found" });
  }

  // Delete the review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
