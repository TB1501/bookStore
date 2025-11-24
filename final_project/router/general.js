const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      return res.status(409).json({ message: "User already exists" });
    }
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User created successfully" });
  } else {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book, null, 2));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const auth = req.params.author;
  const book = Object.values(books).filter((book) => book.author === auth);
  if (book.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book, null, 2));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const title = req.params.title;
  const bookList = Object.values(books).filter((book) => book.title === title);
  if (bookList.length > 0) {
    return res.status(200).send(JSON.stringify(bookList, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Get reviews (may be undefined)
  const reviews = books[isbn].reviews;

  return res.status(200).json({
    reviews: reviews ? reviews : {},
  });
});

module.exports.general = public_users;
