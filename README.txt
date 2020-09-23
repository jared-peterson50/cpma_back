code from devistry
https://www.youtube.com/watch?v=4_ZiJGY5F38&list=PLJM1tXwlGdaf57oUx0rIqSW668Rpo_7oU
******IMPORTANT**********
ip is set to come from my own ip. change before putting on AWS
*************************

goto mongo atlas setup new cluster copy the connection from application and paste code into variable
create .env file


//test with postman
POST http://localhost:5000/users/register
body
{
    "email":"user@gmail.com",
    "password":"password",
    "passwordCheck":"password",
    "displayName":"myUsername"
}

POST http://localhost:5000/users/login
body
{
    "email":"user@gmail.com",
    "password":"password"
}

DELETE http://localhost:5000/users/delete
Header
key:x-auth-token value:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTYzZmRkODQxZmVmMzUzNGVhYmQ3MiIsImlhdCI6MTU5OTQ4ODQ3MX0.bXFeriyR3GiFRHlq69O7VZy2HHXK1OCaccz4xl513ZQ

POST http://localhost:5000/users/tokenisvalid 
Header
key:x-auth-token value:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTYzZmRkODQxZmVmMzUzNGVhYmQ3MiIsImlhdCI6MTU5OTQ4ODQ3MX0.bXFeriyR3GiFRHlq69O7VZy2HHXK1OCaccz4xl513ZQ


GET http://localhost:5000/users/
Header
key:x-auth-token value:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTYzZmRkODQxZmVmMzUzNGVhYmQ3MiIsImlhdCI6MTU5OTQ4ODQ3MX0.bXFeriyR3GiFRHlq69O7VZy2HHXK1OCaccz4xl513ZQ


//it will be a different token every time but it gets returned from the login

walkthrought of node back end
launch node server.js
---server.js-----
starts up middleware, server, db and navigates to routes/userRouter.js at the end

--userRouter---
defines JWT bcrypt and opens middleware/auth.js and models/userModel.js
defines /register /login /delete /isvalidtoken routes. with each function it does error checking

---/models/userModel.js----
imports mongoose, defines the schema, exports to user collection

---/middleware/auth.js----
helper function that verifies if the JWT is correct has some error checking

going back to userRouter breakdown of 
--------router.post('/register'......------
it takes a req,res the req is passed in as a body setup in postman as raw json.  contains this example
{
    "email":"user@gmail.com",
    "password":"password",
    "passwordCheck":"password",
    "displayName":"myUsername"
}
it get destructured inside try block into email password passwordCheck displayname
makes sure required fields are there, password is at least 5 in length, password and passwordCheck match
checks if exists in db against email:email it passes the email address into key email returns boolean t/f
displayName is optional if left empty set to email
bcrypt hashes and salts password saved as passwordHash
newUser object created with passwordHash saved into password
save into db with .save(newUser) returns the newUser object is res

----router.post('/login'.........----------
email and password are passed into the req body and descrutured email,password
make sure they are both passed in.
pull the user from the db by email address. the object user has the hashed and salted password in it
compare the password passed in to the uri against the object user pulled from DB for a match
create a JWT called token with _userID and display name sign it with secret password. Dont put passwords in here it can be decrypted

---skip delete pretty straight forward-----
---router.post('/tokenisvalid........
pass in token in header
jwt.verfify decrypts the token and saves as verfied json object
check verfied.id against DB make sure id is there
function either returns true of false if tokenisValid

---router.get('/'...
pass in token to head and returns you display name and id from DB
---users----

