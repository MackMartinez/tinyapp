const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "firstUser"
  },
  "9sm5xK":{
    longURL: "http://www.google.com",
    userID: "firstUser"
  } 
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

  //find existing email
  const userExists = (email)  => {
    for (const usr in users) {
      if(users[usr].email === email){
        return users[usr];
      }
    }
    return false
  };

//Routes
app.get("/", (req, res) => {
  res.send('Hello!');
});

//Cookies
  
  app.post("/login", (req, res) => {
    const { email,password } = req.body;
    const matchID = userExists(email);

    if(!userExists(email)) {
      //return if email does not exist
      res.status(403).send("403 status - Invalid Credentials")
    } else if ( userExists(email) && matchID.password !== password){
        return res.status(403).send("403 status - Invalid Credentials")
      
    } else {
    
    res.cookie("user_id", matchID.id);
    res.redirect("/urls");
  }});

  app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  if(users[req.cookies["user_id"]]) {
    res.redirect("/urls")
  }
  res.render("login",templateVars)
});

//Read new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  if(!users[req.cookies["user_id"]]) {
    res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

//Read register
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  if(users[req.cookies["user_id"]]) {
    res.redirect("/urls")
  }
  res.render("register",templateVars);
});

// Create new url
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  const { longURL } = req.body;
  if(!users[req.cookies["user_id"]]) {
    return res.send("Please register in order to use TinyApp!");
  }
  urlDatabase[newUrl]= {
    longURL
  };
  res.redirect(`/urls/${newUrl}`);
});


// register email and password

app.post("/register", (req,res) => {
  const { email, password } = req.body;



  if(!email || !password) {
    return res.status(400).send("Please provide e-mail or password");
  } 
  
  if (userExists(email)) {
    return res.status(400).send("400 bad request - User already exists");
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
  const { longURL } = req.body;
  urlDatabase[req.params.id] = {
    longURL
  };
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
  const idCheckP = req.params.id;
  const longURL = urlDatabase[idCheckP].longURL;
  const idCheck = () => {
    for(const id in urlDatabase) {
      if(idCheckP !== id){
      }
      return res.send("ID does not exist!")
    }
    return false;
  }; 
  idCheck();

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
