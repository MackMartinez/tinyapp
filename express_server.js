const express = require('express');
const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomUrl = "";

  for (let x = 0; x < 6; x++) {
    randomUrl += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomUrl;
};

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req,res) => {
  const id = req.params.id;
  const templateVars = { id, longURL: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
  // if (!keys.includes(req.params.id)) {
    res.send("Please enter a valid URL beginning with http://");
    return;
  }
  res.redirect(longURL);
});
