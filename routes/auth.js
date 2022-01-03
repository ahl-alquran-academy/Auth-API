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

const router = require("express").Router();
module.exports = router;

router.get("/", (req, res) => {
  return res.status(200).send("<h1>hello from the auth script</h1>");
});

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
      return res.status(400).json(validationError);
    //extract user data from request body
    let { userName, userEmail, userPassword, userTelegram } = req.body;
    // check if the user email already registered
    try {
      sqlString = `SELECT * FROM User WHERE email ='${userEmail}'`;
      var isExist = await dbManager.excute(sqlString);
    } catch (error) {
      return res.status(400).json(new ErrorMsg("DBError", error));
    }
    if (Array.from(isExist).length) {
      return res
        .status(400)
        .json(new ErrorMsg("DBError", "User Already Exist"));
    }
    // generate an activation code
    const activationCode = await createActivationCode();
    //send activation code by email
    try {
      await Mailer(userEmail, "acitvate account", activationCode);
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json(new ErrorMsg("MailError", "mail sending error"));
    }
    // hash the user password
    let hashedPassword = await bcrypt.hash(userPassword, 5);
    // save user to the database
    sqlString = `INSERT INTO User (ID, UserName, Telegram, Email, Password, ActivationCode) VALUES (NULL, '${userName}', '${userTelegram}', '${userEmail}', '${hashedPassword}', '${activationCode}');`;
    try {
      await dbManager.excute(sqlString);
    } catch (error) {
      return res.status(400).json(new ErrorMsg("DBError", error));
    }
    return res
      .status(200)
      .json(new ErrorMsg("successfull", "User Was Created"));
  }
);

// login route
router.post("/login", async (req, res) => {
  let { userEmail, userPassword } = req.body;
  try {
    let sqlString = `SELECT * FROM User Where email = '${userEmail}'`;
    var result = await dbManager.excute(sqlString);
  } catch (error) {
    return res.status(400).json(new ErrorMsg("DBError", error));
  }
  if (!Array.from(result).length)
    return res.send(new ErrorMsg("DBError", "Invalid Credentials"));
  let user = result[0];
  // compare the password
  let correctPass = await bcrypt.compare(user.Password, userPassword);
  if (!correctPass)
    return res.send(new ErrorMsg("DBError", "Invalid Credentials"));
  let token = await JWT.sign(
    {
      userID: user.ID,
    },
    "isafe",
    { expiresIn: 360000 }
  );
  console.log("hi there");
  let userCookie = {
    userId: user.ID,
    userName: user.UserName,
    token: token,
  };
  res.cookie("userPassport", userCookie);
  res.status(200).json(new ErrorMsg("done", "User Logged in"));
});

router.post("/all", async (req, res) => {
  try {
    let sqlString = "SELECT ID, UserName FROM User";
    let allUsers = await dbManager.excute(sqlString);
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(400).json(new ErrorMsg("DBError", error));
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
