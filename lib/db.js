class db {
    constructor() {
        this.mysql = require('mysql');
        this.connection = this.mysql.createConnection({
            host: '127.0.0.1',
            user: 'checker',
            password: 'checker123',
            database: 'checker'
        });

        this.connection.connect();
    }

    sendQuery(query) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, (err, result) => {
              if (err) {
                reject(err);
              }
              else {
                resolve(result);
              }
            });
        });
    }
}

module.exports = db;