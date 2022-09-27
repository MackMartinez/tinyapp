const cookieSession = require('cookie-session');
const express = require('express');
const bcrypt = require('bcryptjs');
const { getUserByEmail,generateRandomString, urlsForUser } = require('./helpers');
const { users, urlDatabase } = require("./databases");
const port = 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['mackDev1','2089md'],

  // Cookie Options
  maxAge: 10 * 60 * 1000 // 10 min
}));

//Routes
app.get("/", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.redirect("/login");
});

//Cookies
  
app.post("/login", (req, res) => {
  const { email,password } = req.body;
  const userID = getUserByEmail(email,users);
  const matchID = users[userID];
  const passwordsMatch = bcrypt.compareSync(password, matchID.password);

  
  //return if email does not exist
  if (!getUserByEmail(email,users)) {
    res.status(403).send("403 status - Invalid Credentials");
    
  } else if (!passwordsMatch) {
    return res.status(403).send("403 status - Invalid Credentials");
      
  } else {
    
    req.session.user_id = matchID.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Create & Read/Get & Post

app.get("/urls", (req,res) => {
  const userLoggedIn = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: userLoggedIn
  };

  if (!userLoggedIn) {
    return res.send("Please login");
  }

  res.render("urls_index", templateVars);
});

//ready login
app.get("/login", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };

  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.render("login",templateVars);
});

//Read new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//Read register
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };

  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.render("register",templateVars);
});

// Create new url
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  const { longURL } = req.body;
  if (!users[req.session.user_id]) {
    return res.send("Please register in order to use TinyApp!");
  }

  urlDatabase[newUrl] = {
    longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${newUrl}`);
});


// register email and password

app.post("/register", (req,res) => {
  const { email, password } = req.body;
  let hashedPassword = bcrypt.hashSync(password, 8);
  if (!email || !password) {
    return res.status(400).send("Please provide e-mail or password");
  }
  if (getUserByEmail(email,users)) {
    return res.status(400).send("400 bad request - User already exists");
  }
  
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  req.session.user_id = id;
  res.redirect("/urls");
});


//Delete single
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (req.session.user_id !== urlDatabase[id].userID) {
    return res.status(404).send("404 - Not Found");
  }
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

//Create
app.post("/urls/:id", (req, res) => {
  const { longURL } = req.body;
  const userLoggedIn = users[req.session.user_id];
  
  if (!userLoggedIn) {
    return res.send("User does not own URL");
  }
  
  if (userLoggedIn !== urlDatabase[req.params.id].userID) {
    return res.send("User does not own URL");
  }

  urlDatabase[req.params.id].longURL = longURL;

  res.redirect(`/urls`);
});

//Edit
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const userLoggedIn = users[req.session.user_id];

  if (!userLoggedIn) {
    return res.send("User does not own URL");
  }

  const templateVars = {
    id,
    longURL: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//Read single
app.get("/urls/:id", (req,res) => {
  const id = req.params.id;
  const userLoggedIn = users[req.session.user_id];
  const templateVars = {
    id,
    longURL: urlDatabase,
    user: users[req.session.user_id]
  };
  
  if (!userLoggedIn) {
    return res.send("User does not own URL");
  }

  if (userLoggedIn !== urlDatabase[req.params.id].userID) {
    return res.send("User does not own URL");
  }

  res.render("urls_show", templateVars);
});

//Read single
app.get("/u/:id", (req, res) => {
  const idParam = req.params.id;
  const longURL = urlDatabase[idParam];
  const userLoggedIn = users[req.session.user_id];

  if (!userLoggedIn) {
    return res.send("User does not own URL");
  }

  if (!longURL) {
    return res.status(404).send("404 - Invalid or missing URL");
  }

  if (!longURL.longURL) {
    return res.status(404).send("Please enter a valid URL beginning with http://");
  }
  res.redirect(longURL.longURL);
}
);

// //if route doesn't exist
app.use((req,res) => {
  res.status(404).send("URL not found");
});

//listener
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
