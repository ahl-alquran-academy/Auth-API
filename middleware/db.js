const mysql = require("mysql");

class dbManager {
  connection;
  constructor(connectionString) {
    this.connectionString = connectionString;
  }
  startConnection() {
    return new Promise((resolve, reject) => {
      this.connection = mysql.createConnection(this.connectionString);
      this.connection.connect((error) => {
        if (error) reject("cannot connect to database");
        resolve("connection successful");
      });
    });
  }
  excute(query) {
    return new Promise(async (resolve, reject) => {
      await this.startConnection().then(
        (resolved) => {},
        (rejectd) => {
          reject("Cannot Connect To Database");
        }
      );
      this.connection.query(query, (error, result) => {
        if (error) {
          reject("SQL Error");
        } else {
          this.connection.end();
          resolve(result);
        }
      });
    });
  }
}

function createManager(connectionString) {
  return new dbManager(connectionString);
}

module.exports = createManager;
