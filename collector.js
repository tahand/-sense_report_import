const {logMessage} = require("./logger.js");
const { processQueue, signIn, generateDateList } = require("./importData.js");
const {runSQL} = require("./sql_pool.js");

function getSitesList(){
    
    const sqls = "select * from tblSites S where s_demo = 0 and s_archived = 0 and s_Name = 'moorlandgarden' order by s_Name;";
    
    runSQL("", sqls,
    (sitesList)=>{ 
        
        //console.log(sitesList)
        const daysBack = generateDateList(180);
        const importMap = [];

        sitesList.forEach(site => {

            console.log(site);
            //check for a sense config first or maybe get this from the sql connection.
            const statusList = ["bed", "chair"];
            
            daysBack.forEach(d=>{
                statusList.forEach(s=>{
                    importMap.push({
                        "id" : site.s_ID,
                        "ref" : `${site.s_db_code}_site/config/Vayyar/Main Panel/presence/records/${s}/${d}`,
                        "dbPath" :  site.s_db_path
                    })
                })
            })    

        })
//        console.log(importMap);

        signIn()
        .then(d=>{
            processQueue(importMap);
        })
        .catch(e=>{console.log(e)})
    
    },
    (e)=>{ logMessage("info", e.toString()) });
    
}

module.exports = { getSitesList };