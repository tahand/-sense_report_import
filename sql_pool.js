const mysql = require('mysql2');
//const NodeCache = require('node-cache');
//const cache = new NodeCache();

const pool = mysql.createPool({ 
    host: "35.205.100.172",
    user: "testuser",
    password: "testuser",
    database: 'AIDA',
    waitForConnections: true, // Optional, if set to false, it will throw an error when no connections are available.
    connectionLimit: 10,      // Maximum number of connections in the pool.
    queueLimit: 0            // Maximum number of connection requests in the queue (0 means no limit).S
});


function runSQL(title, sql, onData, onError) {
    //NO_CACHE to be passed if you just want to run the query
    if (title==="121212"){
        fetchDataFromMySQLAndCache(title, sql, 3600)
        .then((data) => onData(data))
        .catch((error) => onError(error.toString()));
    }
    else {
        getDBData(sql).then((data) => onData(data)).catch((error) => onError(error.toString()));
    }
}

async function getDBData(sql){
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if(err) reject(err);
            connection.query(sql, (err, rows) => {
                connection.release(); // return the connection to pool
                if(err) reject(err);
                resolve(rows);
            });
        });

    });

}

function siteExistsSQL(siteCode){
    return new Promise((resolve, reject) => {
      storedProcedure = "v2_onboarding_site_get_id_from_code";
      const sql = "Call AIDA." + storedProcedure + "('user','" + siteCode + "');";
      runSQL("NO_CACHE", sql, (data)=>{
        const rows = data[0];
        if (rows.length===0) resolve("-1");
        resolve(rows[0].siteID);
      }, (err)=>{reject(err);});  
    });
  }

// Function to fetch data from MySQL and cache it
function fetchDataFromMySQLAndCache(key, query, ttlInSeconds) {
  //const cachedData = cache.get(key);
  //if (cachedData) {
  //  return Promise.resolve(cachedData);
  //} else {
    return new Promise((resolve, reject) => {

        getDBData(query)
        .then((data) => {
            cache.set(key, data, ttlInSeconds);
            resolve(data);
        })
        .catch((error) => reject('Error fetching data from MySQL:', error));

    });
  //}
}


function getDataFromJSONFile(fileName) {
    
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(fileName));
}


function saveRowDataToJSONFile(data, fileName) {
    const fs = require('fs');
    fs.writeFile(fileName, JSON.stringify(data), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

module.exports = {runSQL, siteExistsSQL} ;