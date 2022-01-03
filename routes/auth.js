const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
connectionString = {
  host: "mysql-64324-0.cloudclusters.net",
  port: 19984,
  user: "ibrahimElmourchidi",
  password: "12345678",
  database: "authdb",
};
const db = require("../middleware/db");
const dbManager = db(connectionString);
const Mailer = require("../middleware/mail");
const SqlString = require("mysql/lib/protocol/SqlString");
const { append } = require("express/lib/response");
const { response } = require("express");

const router = require("express").Router();
module.exports = router;

router.get("/", (req, res) => {
  return res.status(200).send("<h1>hello from the auth script</h1>");
});
//signup route
router.post(
  "/signup",
  [
    check("userEmail", "البريد الالكتروني غير صحيح").isEmail(),
    check("userPassword", "من فضلك ادخل كلمة مرور من 8-30 حرف").isLength({
      min: 8,
      max: 30,
    }),
    check("userName", "ادخل اسم مستخدم من 3-50 حرف").isLength({
      min: 3,
      max: 50,
    }),
    check("userTelegram", "رقم التيليجرام طوله من 11-25 حروف فقط")
      .isLength({ min: 11, max: 25 })
      .isNumeric(),
  ],
  async (req, res) => {
    //validate user data
    const validationError = validationResult(req);
    if (!validationError.isEmpty())
      return res.status(200).json(validationError);
    //extract user data from request body
    let { userName, userEmail, userPassword, userTelegram } = req.body;
    // check if the user email already registered
    try {
      sqlString = `SELECT * FROM User WHERE Email ='${userEmail}' OR Telegram= '${userTelegram}'`;
      var isExist = await dbManager.excute(sqlString);
      var user = isExist[0];
    } catch (error) {
      return res.status(200).json(new ErrorMsg("DBError", error));
    }
    if (Array.from(isExist).length) {
      if (user.Telegram == userTelegram)
        return res
          .status(200)
          .json(new ErrorMsg("DBError", "Telegram Already Exist"));
      return res
        .status(200)
        .json(new ErrorMsg("DBError", "Email Already Exist"));
    }
    // generate an activation code
    const activationCode = await createActivationCode();
    // hash the user password
    let hashedPassword = await bcrypt.hash(userPassword, 5);
    // save user to the database
    sqlString = `INSERT INTO User (ID, UserName, Telegram, Email, Password, ActivationCode) VALUES (NULL, '${userName}', '${userTelegram}', '${userEmail}', '${hashedPassword}', '${activationCode}');`;
    try {
      await dbManager.excute(sqlString);
      sqlString = `SELECT * FROM User WHERE Email ='${userEmail}' OR Telegram= '${userTelegram}'`;
      newUser = await dbManager.excute(sqlString);
      var userID = newUser[0].ID;
    } catch (error) {
      return res.status(200).json(new ErrorMsg("DBError", error));
    }
    //send activation code by email
    try {
      await Mailer(
        userEmail,
        "Welcome To Ahlelquran",
        `to acitvate account click on this link : https://ahlelquran-academy.web.app/auth/activate/${userID}/${activationCode}`
      );
    } catch (error) {
      console.log(error);
      return res
        .status(200)
        .json(new ErrorMsg("MailError", "mail sending error"));
    }
    return res.status(200).send({ userID });
  }
);

// login route
router.post("/login", async (req, res) => {
  var user;
  let { userEmail, userPassword } = req.body;
  try {
    let sqlString = `SELECT * FROM User Where email = '${userEmail}'`;
    let result = await dbManager.excute(sqlString);
    user = result[0];
  } catch (error) {
    return res.status(200).json(new ErrorMsg("DBError", error));
  }
  correctPass = await bcrypt.compare(userPassword, user.Password);
  if (!correctPass) {
    return res.send(new ErrorMsg("DBError", "Invalid Credentials"));
  }
  let token = await JWT.sign({ userID: user.ID }, "isafe");
  let response = {
    userId: user.ID,
    userName: user.UserName,
    token: token,
  };
  res.status(200).json(response);
});

// get all users route
router.post("/all", async (req, res) => {
  try {
    let sqlString = "SELECT ID, UserName FROM User";
    let allUsers = await dbManager.excute(sqlString);
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(200).json(new ErrorMsg("DBError", error));
  }
});

//activation route
router.post("/activate", async (req, res) => {
  // get the id and the code
  let { id, code } = req.body;
  let token = await JWT.sign({ userID: id }, "isafe");
  // check if user exist
  try {
    sqlString = `SELECT * FROM User WHERE ID = ${id}`;
    let result = await dbManager.excute(sqlString);
    var user = result[0];
  } catch (err) {
    return res.status(200).json(new ErrorMsg("DBError", error));
  }
  var response = {
    userID: id,
    userName: user.UserName,
    token,
  };
  if (!user)
    return res.status(200).json(new ErrorMsg("DBError", "user not found"));
  if (user.ActivationCode != code)
    return res
      .status(200)
      .json(new ErrorMsg("DBError", "wrong Activation code"));
  try {
    sqlString = `UPDATE User SET Policy = '100' WHERE User.ID = '${id}';`;
    console.log("editing");
    await dbManager.excute(sqlString);
    sqlString = `SELECT * FROM Student  WHERE User_ID = '${id}'`;
    let result = await dbManager.excute(sqlString);
    if (Array.from(result).length) return res.status(200).json(response);
    sqlString = `INSERT INTO Student (User_ID) VALUES ('${id}')`;
    await dbManager.excute(sqlString);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(new ErrorMsg("DBError", error));
  }
});

//get self data
router.post("/getselfData", async (req, res) => {
  let { token } = req.body;
  try {
    var isVerified = JWT.verify(token, "isafe");
  } catch (error) {
    return res.status(200).json(new ErrorMsg("Token Error", "Invalid Token"));
  }
  let { userID } = isVerified;
  try {
    sqlString = `SELECT * FROM User WHERE ID = '${userID}'`;
    let result = await dbManager.excute(sqlString);
    if (!Array.from(result).length)
      return res.status(200).json(new ErrorMsg("DBError", "User Not Found"));
    let userObject = result[0];
    return res.status(200).json({
      userID: userObject.ID,
      userName: userObject.UserName,
      token: await JWT.sign({ userID: userObject.ID }, "isafe"),
    });
  } catch (error) {
    return res.status(200).send(new ErrorMsg("DBError", error));
  }
});

//Error message builder
function ErrorMsg(type, msg) {
  this.param = type;
  this.msg = msg;
  return { Errors: [this] };
}

// create activation code
function createActivationCode() {
  return new Promise((resolve, reject) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    resolve(result);
  });
}
