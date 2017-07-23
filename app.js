//FRED Adicionei embaixo para debugar objeto
//const util = require('util');
var _ = require('underscore');
var request = require('request');
var FB = require('fb');
var fs = require('fs');
var argv = require('yargs').option({
    album : {
        //demand : true,
        alias:[ 'n','a'],
        description: "Name Of The Album(default: Timeline Photos)",
        type: 'string'
    },
    pages : {
        alias: 'p',
        description: "Name Of The page (default: me)",
        type: 'string'
    },
    since_date : {
        alias: 'd',
        description: "Since date (default: 2017-01-01)",
        type: 'datetime'
    }
}).help('help').alias('help','h').argv

var my_token = "EAACEdEose0cBAOVdvGzRb4AZBtymmMm1aQEfRidnL66cGDGeXs2n0Aianex7NDDnjGSlx8RISGmmHjg2MUcxU4ZCky7uUeVzeeW5GbCXRlTM2kCtTppaEONV8Fydv9hfakS8mdaUw3DTK6go0ZCeDwdQPnCeapbeYB7IaKt3itxZB57Q5Vz84FHvpn1JuSAZD";

FB.setAccessToken(my_token);
var urls = [];
var count = 1;
var i = 0;
var j = 0;
var album_name = argv.album || "Timeline Photos";
var page_name = argv.pages || "me";
var since_date = argv.since_date || "2017-06-01";

console.log("album_name="+album_name);
console.log("page_name="+page_name);
console.log("since_date="+since_date);
function downloadLoop(urls) {
            for(i;i<urls.length;i++){
                request(urls[i]).pipe(fs.createWriteStream('img/'+page_name+'_'+since_date+'_'+(i+1)+'.jpg')).on('finish', function(response) {
                    console.log("Download Completed : "+(++j)+'/'+i);
                    });

            }
}

function download(next) {
        request({
            url: next,
            json: true
        }, function(err, res, body) {
            if(err) throw err;
            for (var i = 0; i < body.data.length; i++) {
                urls.push(body.data[i].source);
            }
            console.log("getting images... Total Images Found : "+ urls.length);
            if(body.paging && body.paging.next) {
             download(body.paging.next);

        } else {
                console.log("Completed");
            }
downloadLoop(urls);
        });
}


FB.api('/v2.10/'+page_name+'/albums','get',  function (res) {
        if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
        }

        var data = _.findWhere(res.data, {name:album_name});
        //console.log(util.inspect(data, false, null))
        //console.log(JSON.stringify(data, null, 4));
        var nextPage = '/'+data.id+'/photos?fields=source,created_time&since='+since_date;

        FB.api(nextPage, function (response){
            console.log(response.data.length);
            for (var i = 0; i < response.data.length; i++) {
                console.log(response.data[i].source);
                urls.push(response.data[i].source);
            }
             console.log("Getting images... Total Images Found : "+ urls.length);
             if(response.paging && response.paging.next) {
                download(response.paging.next);
             } else {
                 downloadLoop(urls);
             }
        });
    });
