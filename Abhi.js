const express = require("express");
const app = express();
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
var passwordHash = require("password-hash");
app.use(express.urlencoded({ extended: true}));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());



const request = require("request");

app.use(express.static("public"));
app.set("view engine", "ejs");

const serviceAccount = require("./key2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/public/" + "homepage.html");
  console.log("I'm here");
});

app.get("/signup", function(req , res){
  res.sendFile(__dirname + "/public/" + "signup.html");

});
app.post("/signupSubmit", function(req , res){
  db.collection("webpage").where("Email", "==", req.body.Mail).get()
  .then((docs) =>{
    if(docs.size >0){
      res.sendFile(__dirname + "/public/" + "error.html");

    }
    else{
      db.collection("webpage")
  .add({
      Firstname : req.body.Firstname,
      Lastname : req.body.Lastname,
      Email   : req.body.Mail,
      Password   :passwordHash.generate(req.body.Pass)
  }).then(() => {
      res.sendFile(__dirname + "/public/" + "login.html");
      
});
    }
  });
  
});
app.get("/login", function(req , res){
  res.sendFile(__dirname + "/public/" + "login.html");
});



app.post("/loginsubmit", function(req, res){
  console.log("Received a POST request to /loginsubmit");
  //passwordHash.verify(req.query.Password, hashedPassword)
   db.collection("webpage")
  .where("Email", "==", req.body.Email)
  
  .get()
  .then((docs) => {
      let verified = false;
      docs.forEach((doc) =>{
        verified = passwordHash.verify(req.body.Password, doc.data().Password);
      });
      if(verified){
        res.render("movie");
      }
      else{
        res.sendFile(__dirname + "/public/" + "login.html");

      }
       
     // if (docs.size > 0) {
      //    res.render("movie");
     // } else {
     //     res.sendFile(__dirname + "/public/" + "login.html");
     // }
    //  console.log(docs.size);
  });
});

app.get("/moviesearch", function (req, res) {
  const movienameeee = req.query.movie;
  request(
    "https://www.omdbapi.com/?t=" + movienameeee + "&apikey=f278fa1e",
    function (error, response, body) {
      if ("error" in JSON.parse(body)) {
        if (JSON.parse(body).error.code.toString().length > 0) {
          res.render("movie");
        }
      } else {
        const Director = JSON.parse(body).Director;
        const Rating = JSON.parse(body).imdbRating;
        const Writer = JSON.parse(body).Writer;
        const Released = JSON.parse(body).Released;
        const Actors = JSON.parse(body).Actors;
        const BoxOffice = JSON.parse(body).BoxOffice;
        const Awards = JSON.parse(body).Awards;
        const Poster = JSON.parse(body).Poster;

        res.render("details", {
          director: Director,
          rating: Rating,
          writer: Writer,
          released: Released,
          actors: Actors,
          boxoffice: BoxOffice,
          awardss: Awards,
          posterimgurl: Poster,
        });
      }
    }
  );
});

app.listen(3000);
console.log("I'm working");
