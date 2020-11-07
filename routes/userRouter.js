const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//user generated files
const auth = require("../middleware/auth");
const authAdmin = require('../middleware/authAdmin');
const User = require("../models/userModel");
const admin_access = require('../middleware/adminList');
//const uploadFile = require('../routes/fileUpload');


router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName, teamName, teamNumber } = req.body;
    // validate
    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "Not all fields have been entered." });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: "Enter the same password twice for verification." });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });

    if (!displayName) displayName = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    //with a role it has email,password,displayName, role
    var check = (admin_access.indexOf(email) > -1);
    var role = "";
    if(check)
      role = "admin";
    else 
      role = "user";
    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
      teamName,
      teamNumber,
      role,
    });
    //const savedUser = await newUser.save();
    //remove the password from here
    const saveUser = await newUser.save();
    //console.log(saveUser);
    res.json(saveUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({ msg: "Not all fields have been entered." });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        teamName: user.teamName,
        teamNumber: user.teamNumber,
        role:user.role
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//
router.delete("/delete", auth, async (req, res) => {
  try {
    //const deletedUser = await User.findByIdAndDelete(req.user);
    var id = req.headers["user"];
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//returns 
router.get("/userList", auth, async (req, res) => {
  User.find(function (err, users) {
    var userMap = {};
    users.forEach(function(user) {
      userMap[user._id] = user;
    });
    res.send(userMap);  
  if(err)
    console.log(err);
  });
});
//from app
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id,
  });
});

// Upload Endpoint for Admin
router.post('/upload', (req, res) => {
if (req.files === null) {
  return res.status(400).json({ msg: 'No file uploaded' });
}

const file = req.files.file;
//move it to the root folder/uploads
file.mv(`${__dirname}/../uploads/${file.name}`, err => {
  if (err) {
    console.error(err);
    return res.status(500).send(err);
  }
  res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
});
});

//coffee order for team
router.post("/teamorder", async (req, res) => {
  
  try {
      var total_points=0; //decare up here is its remains in scope to be returned
      const temp = req.body;
      //console.log("printing form data json")
      //console.log(temp);
      var team_order_values = Object.values(temp); //array containing only values no keys

      //console.log("printing csv data converted to json")
      const csvFilePath=(__dirname + '\\..\\uploads\\admin_upload.csv');
      //console.log(csvFilePath);
      const csv=require('csvtojson')
      //this is async we need to await it because we are returning a value before the process completes
      await csv()
      .fromFile(csvFilePath)
      .then((jsonObj)=>{
          /* game logic. We have coffee type, price, quantity ordered and demand. Demand is unkown to
          the player. The Demand is set in the csv file by the admin. When a team sets the quantity ordered
          it will be compared against demand. The closest to value to the demand is desirable. If a player
          gets with 20% of the demand that is 100 points. If within 50% its 50 points. If
          worse than 50% zero points are given. There are 5 coffees a max points of 500 can be obtained
          */
          //console.log(jsonObj);
          //console.log(jsonObj[0]);
          //console.log(jsonObj[0].demand);
          //console.log(team_order_values[0]);
          
          //make for loop that checks if the user value is +- within the 20% or 50% range
          for(var i = 0; i < 5; i++)
          {
            var lower = jsonObj[i].demand * .8;
            var upper = jsonObj[i].demand * 1.2;
            var min = jsonObj[i].demand *.5;
            var max = jsonObj[i].demand * 1.5;
            if(team_order_values[i] > lower && team_order_values[i] < upper)
              total_points += 100;
            else if(team_order_values[i] > min && team_order_values[i] < max)
              total_points += 50;
          }
            console.log("total points " + total_points);
          //print the data to console
      })
      console.log("final printing")
    
    return res.json({msg:total_points});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
