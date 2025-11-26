const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

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

//Get with fetch
public_users.get("/callback", (req, res) => {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  })
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(500).send(err));
});

//Get with async/await
public_users.get("/async", async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      resolve(books);
    });

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Get with axios
public_users.get("/axios", async (req, res) => {
  try {
    const result = await axios("http://localhost:5000/"); //Public fake API for testing AXIOS
    res.status(200).send(result.data);
  } catch (err) {
    res.status(500).send(err);
  }
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

//Get book details based on ISBN with fetch
public_users.get("/isbn/callback/:isbn", function (req, res) {
  new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("No book with the isbn found");
    }
  })
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(500).send(err));
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

//get book details based on author with async
public_users.get("/author/async/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const book = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(
        (item) => item.author === author
      );
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("Book not found");
      }
    });

    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json(err);
  }
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

//Get all books base on title with axios
public_users.get("/title/axios/:title", async function (req, res) {
  try {
    const title = req.params.title;

    // Fetch all books from local /books route
    const response = await axios.get("http://localhost:5000/");

    // Filter books by title
    const result = Object.values(response.data).filter(
      (b) => b.title === title
    );

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
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
