const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
};

//Randomize tiny URL
const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomUrl = "";

  for (let x = 0; x < 6; x++) {
    randomUrl += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomUrl;
};

//Routes
app.get("/", (req, res) => {
  res.send('Hello!');
});

//Cookies
  
  app.post("/login", (req, res) => {
    res.redirect("/register");
  });

  app.post("/logout", (req, res) => {

    res.redirect("/register");
  });

//Create & Read/Get & Post

app.get("/urls", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//ready login
app.get("/login", (req,res) => {
  res.render("login")
});

//Read new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//Read readister
app.get("/register", (req, res) => {
  res.render("register");
});

// Create new url
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});


// register email and password

app.post("/register", (req,res) => {
  const { email, password } = req.body;

  //find existing email
const userExists = ()  => {
  for (const usr in users) {
    if(users[usr].email === email){
      return true;
    }
  }
  return false
};

  if(!email || !password) {
    return res.status(400).send("Please provide e-mail or password");
  } 
  
  if (userExists()) {
    return res.status(400).send("400 bad request - email already exists");
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };

  console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//Delete single
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//Create 
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

//Edit
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    longURL: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Read single
app.get("/urls/:id", (req,res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    longURL: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Read single
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("Please enter a valid URL beginning with http://");
    return;
  }
  res.redirect(longURL);
});

//if route doesn't exist
app.use((req,res) => {
  res.status(404).send("URL not found");


  //200 for found 
});

//listener
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
