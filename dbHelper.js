var mysql = require('mysql');

function getConnection(){
    return new Promise(async (resolve, reject)=>{

        var con = mysql.createConnection({
            host: "35.205.100.172",
            user: "testuser",
            password: "testuser"
        });

        con.connect(function(err) {
                
            if (err) {
                reject(err.toString())
            } else {
                resolve(con);
            }
        })            

    })
}

function closeConnection(connection){
    connection.end(err => {
        if (err) {
            console.error('Error closing MySQL connection:', err);
        } else {
            console.log('MySQL connection closed successfully.');
        }
    });
}

function executeQuery(connection, sql, callback) {
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

/*
                    con.query(sql, function(err, rows) {
                        if (err) console.log("ERROR: datacollector_add_call:: " + err);
                        rows.map(site=>{                            
                            const firebase_panel_date_ref = site.s_code + "/" + firebase_pickup_date_format;
                            let strDate = moment(firebase_pickup_date_format, "DDMMYYYY").format("YYYY-MM-DD");    
                            console.log("firebase_panel_date_ref:: " + firebase_panel_date_ref);
                            console.log(firebase_panel_date_ref);
                            let refTest = firebase.database().ref(firebase_panel_date_ref);
                            refTest.once("value", snapshot=>workThroughDBSnapshot(snapshot, firebase_panel_date_ref, site, con, strDate, firebase_pickup_date_format));
                        });
                    });
*/

module.exports = { getConnection, closeConnection, executeQuery };