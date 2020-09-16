const jwt = require("jsonwebtoken");
const admin_access = require('./adminList');
//check if email is in admin_access array and set role appropriately


const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res
        .status(401)
        .json({ msg: "No authentication token, authorization denied." });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });

    req.user = verified.id;
    
    //admin checking call async func 
    admin_test(req.user);
    //if we made it here just finish out
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//helper function to get query the db and check if there is admin role assigned
async function admin_test(id) {
  const user = await User.findById(id);
  if(admin_access.indexOf(user.email) > -1) //true if there is a match
    return;
  else
  {
    return res
        .status(401)
        .json({ msg: "you do not have admin role assigned" });
  }
}

module.exports = auth;
