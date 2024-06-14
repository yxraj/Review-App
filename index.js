const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to handle URL encoded data
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Read user data
let users = [];
fs.readFile('testjson/user.json', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    try {
      users = JSON.parse(data);
      if (!Array.isArray(users)) {
        users = []; // Ensure users is an array
      }
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
    }
  }
});

// Middleware to check review content
app.use((req, res, next) => {
  if (req.body.review === '') {
    res.end("Please Write a Review!");
  } else {
    next();
  }
});

// Route to render index page
app.get('/', (req, res) => {
  res.render('index', { users: users });
});

// Route to handle review submission
app.post('/review', (req, res) => {
  const now = new Date();
  const review = `The Review is: ${req.body.review} at ${now.toLocaleTimeString()}\n`;

  // Append review to reviews.txt
  fs.appendFile('review/reviews.txt', review, (err) => {
    if (err) throw err;
  });

  // Prepare user review data
  const userJson = {
    "userReview": req.body.review,
    "Time": now.toLocaleTimeString()
  };

  // Add the new review to the users array
  users.push(userJson);

  // Write the updated users array to user.json
  fs.writeFile('testjson/user.json', JSON.stringify(users, null, 2), (writeErr) => {
    if (writeErr) throw writeErr;
  });

  // Render thanks page
  res.render("thanks", { review: req.body.review });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
