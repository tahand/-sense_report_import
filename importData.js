var firebase = require("firebase/app");
const {logMessage} = require("./logger.js");
const { runSQL } = require('./sql_pool.js');

require("firebase/auth");
require('firebase/database');

var firebaseConfig = {
    apiKey: "AIzaSyCOXJtROQlSTEJwcB7WTOx97znL4HswvUg",
    authDomain: "arquella-cc76e.firebaseapp.com",
    projectId: "arquella-cc76e",
    storageBucket: "arquella-cc76e.appspot.com",
    messagingSenderId: "673271376643",
    appId: "1:673271376643:web:63824a897c34e86ac21736",
    measurementId: "G-6JFJ0LGN32"
};


const defaultDatabase = firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();

function generateDateList(daysBack) {
    const dateList = [];
    const today = new Date();

    for (let i = 0; i < daysBack; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
//        const formattedDate = `${('0' + date.getDate()).slice(-2)}${('0' + (date.getMonth() + 1)).slice(-2)}${date.getFullYear()}`;
        const formattedDate = `${(date.getDate())}${((date.getMonth() + 1))}${date.getFullYear()}`;
  
        dateList.push(formattedDate);
    }

    return dateList;
}

function signIn(){
    return new Promise((resolve, reject)=>{
        
        auth.signInWithEmailAndPassword("datacollector_aida@arquella.co.uk", "Arquella")
        .then(function(result) { resolve("signed in"); })
        .catch(e=>{ reject(e); });
    })    
}


// Get the default database instance for an app1
// Get a database instance for app2
function processQueue(data){
    
    data.map(async d=>{
        console.log(d);

        const DB = getFirebaseDB(d.dbPath)
        await getFirebaseDayData(d.ref, DB)
                .then(async (fbData)=>{
                        if (fbData!==null) {
                            console.log(fbData);
                            Object.values(fbData).forEach(async (rec)=>{

                                const sql = `INSERT INTO DeviceEvents (siteID, device_path, device_code, start_date, end_date) VALUES 
                                (${d.id}, '${rec[0]}', '${rec[1]}', '${rec[2]}', '${rec[0]}');`;
                                
                                console.log(sql);
                            });
                            //await loopRecords(fbData, d.id)
                        }
                        else {
                            console.log(`No data for ${d.ref}`);
                            logMessage("info", `No data for ${d.ref}`);
                        }
                })
                .catch(e=>logMessage("info", e.toString()));
        
    })
    
}

function getFirebaseDB(path){
    try {
        return defaultDatabase.database(path);
    } catch(d){
        return null;
    }
}


function convertDateFormat(dateString) {
    // Parse the input date string in local time
    const date = new Date(dateString);

    // Get the UTC time by subtracting the timezone offset
    //const utcTime = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    //UTC NEEDS ATTENTION
    const utcTime = new Date(date.getTime());

    // Get the components of the UTC date
    const year = utcTime.getUTCFullYear();
    const month = String(utcTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcTime.getUTCDate()).padStart(2, '0');
    const hours = String(utcTime.getUTCHours()).padStart(2, '0');
    const minutes = String(utcTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utcTime.getUTCSeconds()).padStart(2, '0');

    // Construct the formatted date string
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

function getDates(rec, fields){
    let dt = rec[fields[0]];
    dt = convertDateFormat(dt); 
    return dt;
}

function cleanText(txt) {
    if (typeof(txt)=="undefined") return "";
    return txt.replace("'","");
}

async function loopRecords(records, siteID){
    return new Promise(async (resolve,reject)=>{
        const startFields = ["start"];
        const endFields = ["end_date_time"];
		
		let iCount = 0;
        
        for (const rec of Object.keys(records)) {
            
            const data = records[rec];
    
            if (data.callType !== "Visit") {

            
            if ((data.end === "Live") || (typeof(data.start) === "undefined")) {
                logMessage("info", `Live record in db - ${siteID} - ${rec}`);
            }
            else {

                let startDate = getDates(data, startFields);
                let endDate = getDates(data, endFields);
                const roomClean = cleanText(data.room);
                let zoneClean = cleanText(data.zone);
                let carerClean = cleanText(data.carer);
                const clearType = cleanText(data.clearType);
                const callRef = rec;
                const callType = data.callType;
				
				try {
					if (startDate>endDate) {
						const tmpStart = startDate;
						startDate = endDate;
						endDate = tmpStart;
					}
				}
				catch(e){
					logMessage("info", e.toString());
				}
				
                const sql = `call AIDA.datacollector_add_call("${data.panelRef}", "${siteID}", "${startDate}", "${endDate}", "0", "${roomClean}", "${callType}", "${zoneClean}", "${carerClean}", "${clearType}", "${callRef}", "${data.journeyRef}");`;
                
                await updateDB(sql).then((d)=>{
                    
                }).catch(e=>{
				//	console.log(e)
				})
                
            }
            }
            iCount++;
        };
        resolve();
    })
}

function updateDB(sql){
    return new Promise((resolve, reject)=>{
        runSQL("", sql,(d)=>{    resolve(sql)    }, (e)=>{reject(e)});    
    })
}

function getFirebaseDayData(ref, DB){
    return new Promise((resolve, reject)=>{
        let refTest = DB.ref(ref);
        refTest.once("value", snapshot=>resolve(snapshot.val()));
    });
}

module.exports = { processQueue, signIn, generateDateList };