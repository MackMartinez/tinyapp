//find existing email
const getUserByEmail = (email,database)  => {
  for (const usr in database) {
    if (database[usr].email === email) {
      return database[usr].id;
    }
  }
  return;
};

//Randomize tiny URL
const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomUrl = "";

  for (let x = 0; x < 6; x++) {
    randomUrl += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomUrl;
};

//urls object for unique user

const urlsForUser = (id, urlDatabase) =>{
  const uniqueUserDatabase = {};
  for (const val in urlDatabase) {
    if (id === urlDatabase[val].userID) {
      uniqueUserDatabase[val] = {
        longURL: urlDatabase[val].longURL,
      };
    }
  }
  return uniqueUserDatabase;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};