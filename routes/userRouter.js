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

// Upload Endpoint
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


module.exports = router;
