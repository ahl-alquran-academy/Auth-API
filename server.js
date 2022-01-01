/**
 * the first thing we need to do is to create the httpServer that will listen
 * to the requests, for that i will use an express app so lets require the
 * express package, and create an app
 */
let express = require("express");
/**
 * the express package returns afunction that when invoked create the express
 * app
 */
let app = express();
app.use(express.json());
/**
 * after creating the app lets now manage our routes, we can put all
 * of our routes in this script, but its a best practice to isolate
 * the routes into separate scripts.
 * so lets create our route script and use it in the app
 */
const auth = require("./routes/auth");
app.use("/auth", auth);
app.all("/", (req, res) => {
  return res.redirect("/auth");
});

// now lets assign aport for the app to listen on to
let port = process.env.PORT || 5000;
app.listen(port, console.log(`listening on port ${port}`));
