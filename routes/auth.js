/**
 * to use this module as arouter module we need to use express.Router()
 * to create router object and then export this router object
 */
const router = require("express").Router();
module.exports = router;
/**
 * the router object have few method for handling the incomming requests:
 *      1.all: this will be invoked when a request is made to the given route,
 *      despite of the request method
 *      2. get: this will be invoked  when a get request is made to the given
 *      route
 *      3. post: this will be invoked  when a post request is made to the given
 *      route
 *      4. put: this will be invoked  when a put request is made to the given
 *      route
 *      5. delete: this will be invoked  when a delete request is made to the
 *      given route.
 * each of these method takes 2 basic parameters :
 *      1. route
 *      2. call back.
 */

router.get("/", (req, res) => {
  res.send("<h1>hello from the auth script</h1>");
});

router.post("/signup", (req, res) => {
  res.send("signup page");
});
