var http = require('http');
var port = 8186;
const {getSitesList} = require("./collector");
function handleGetRequest(request, response) {
    response.write("<p>Running Import</p>");
    getSitesList();
    response.end();    
}

getSitesList();

http.createServer(handleGetRequest).listen(port, () => { console.log('http://127.0.0.1:' + port); });