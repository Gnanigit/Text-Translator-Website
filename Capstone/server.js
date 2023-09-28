var express=require("express")
var path=require("path")
var app=express();
const bcrypt=require("bcrypt");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var serviceAccount = require("./password.json");
const bodyParser=require('body-parser');
app.use(express.static(path.join(__dirname,"/statics")));
app.use('/pics', express.static('pics'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended:false}));
//middle-ware
app.use(express.urlencoded());
const ejs = require('ejs');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
app.use(express.static("public"));

//signup
app.get('/signup',function(req,res){
    const errors={
        Fullname:"",
        Email:"",
        Password:"",
        Re_Password:"",
    }
    res.render("signup",{errors})

})



//signup submit
app.post('/signupsubmit', function (req, res) {
  const Fullname = req.body.Username;
  const Email = req.body.Email;
  const Password = req.body.Password;
  const Re_Password = req.body.Re_Password;
    // Create an empty object to store error messages
    const errors={}
    db.collection("user")
        .where("Email", "==", Email)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                // Email already exists, show an error message
                errors.emailExists = "An account with this email already exists";
                return res.render("signup",{errors});
            }else{
                if (!Fullname) {
                    errors.Fullname="fullname is required"
                }
                
                if (!Email) {
                    errors.Email = 'Email is required';
                }
            
                if (!Password) {
                    errors.Password = 'Password is required';
                }
                if(Password && Password.length<6){
                    errors.Password = 'Password must contain minimum 6 characters';
                }
            
                if (!Re_Password) {
                    errors.Re_Password = 'Re-enter Password is required';
                }
            
                if (Password !== Re_Password) {
                    errors.Re_Password = 'Passwords do not match';
                }
                if (Object.keys(errors).length > 0) {
                    return res.render('signup',{errors})
                }

                else{
                    bcrypt.hash(Password, 10, (err, hash) => { // 10 is the number of salt rounds
                    if (err) {
                      // Handle the error
                      console.error(err);
                      return res.status(500).send('Internal Server Error');
                    }
                
                    // Create a new user document with the hashed password
                    db.collection('user').add({
                      Fullname: Fullname,
                      Email: Email,
                      Password: hash, 
                      Re_password: hash// Store the hashed password
                    }).then(() => {
                      return res.render("login", { errors });
                    });
                  });
                }
            }
        })
        .catch((error) => {
            console.error("Error querying Firestore:", error);
            res.status(500).send("An error occurred while processing your request");
        });
});


//login
app.get('/login',function(req,res){
    //res.send("login")
    const errors={
        Email:"",
        Password:"",
        overall:""
    }
    res.render("login",{errors})
})




app.post('/loginsubmit', function (req, res) {
  const { Email, Password } = req.body;
  const errors = {};
  const name = {};

  if (!Email || !Password) {
    errors.Email = "Email is required";
    errors.Password = "Password is required";
    res.render("login", { errors });
    return;
  }

  db.collection("user")
    .where("Email", "==", Email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        const user = docs.docs[0].data();
        const hashedPassword = user.Password; // Get the hashed password from the database

        // Compare the user-entered password with the hashed password
        bcrypt.compare(Password, hashedPassword, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            res.status(500).send("An error occurred while processing your request");
            return;
          }

          if (result) {
            // Passwords match, so the login is successful
            console.log("login success")
            name.fullname = user.Fullname;
            res.render("trans", { name });
          } else {
            // Passwords don't match
            console.log("ivalid login")
            errors.overall = "Invalid login credentials";
            res.render("login", { errors });
          }
        });
      } else {
        errors.overall = "Invalid login credentials";
        res.render("login", { errors });
      }
    })
    .catch((error) => {
      console.error("Error querying Firestore:", error);
      res.status(500).send("An error occurred while processing your request");
    });
});


app.listen(3000)