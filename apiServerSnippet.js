/**
 * Created by Ryan Berg on 6/9/15.
 * rberg2@hotmail.com
 */

var http = require("http");

var fs = require('fs');

//var mongojs = require('mongojs');
var zlib = require('zlib');
var requestLib = require('request');

http.createServer(function(request, response)
{
    var url = require('url');

    queryJson = url.parse(request.url,true).query;
    var pathname = url.parse(request.url,true).pathname;

    console.log('request received: ' + JSON.stringify(queryJson));
    logRequest(request.connection.remoteAddress);

    if(pathname == '/compete_request' && queryJson.metric && queryJson.domain)
    {
        response.setHeader("Access-Control-Allow-Origin", "http://turingweb.com");
        response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var requestURL = 'https://apps.compete.com/sites/' + queryJson.domain + '/trended/' + queryJson.metric + '/?apikey=####################';

        if (queryJson.start_date && queryJson.end_date)
        {
            requestURL += '&start_date=' + queryJson.start_date + '&end_date=' + queryJson.end_date;
        }
        else if (queryJson.latest)
        {
            requestURL += '&latest=' + queryJson.latest;
        }

        requestLib(requestURL, function (error, responseHeader, body)
        {
            if (!error && responseHeader.statusCode == 200)
            {
                if (request.headers['accept-encoding'].match(/\bgzip\b/i))
                {
                    zlib.gzip(body, function (error, buffer)
                    {
                        if (error)
                        {
                            throw error;
                        }

                        response.writeHead(200, {"Content-Type": "application/json", "Content-Encoding": "gzip"});
                        response.write(buffer);
                        response.end();

                    });
                }
                //gzip not supported
                else
                {
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(body);
                    response.end();
                }
            }
            else
            {
                response.writeHead(responseHeader.statusCode, {"Content-Type": "text/plain"});
                response.end(error);
            }
        });
    }
}).listen(10000);
console.log('server started. listening on port 10000');

function logRequest(ip)
{
    fs.appendFile('apiRequest.log', ',{"_id": "'+new Date()+'","ip":"'+ip+'"}', function (error) {
        if (error) console.log(error);
    });
}