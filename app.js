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
        alias: 's',
        description: "Since date (default: 2017-01-01)",
        type: 'datetime'
    },
    download_locally : {
        alias: 'd',
        description: "Download locally (default: false)",
        type: 'boolean'
    },
    upload_cloudinary : {
        alias: 'c',
        description: "Upload cloudinary (default: false)",
        type: 'boolean'
    }
}).help('help').alias('help','h').argv

const cloudinary = require('cloudinary');
var CLOUDINARY_CONFIG = require('./cloudinary_config.json');
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloud_name,
  api_key: CLOUDINARY_CONFIG.api_key,
  api_secret: CLOUDINARY_CONFIG.api_secret
});

var FACEBOOK_CONFIG = require('./fb_config.json');
var my_token = FACEBOOK_CONFIG.client_id+'|'+FACEBOOK_CONFIG.client_secret;
//var my_token = "EAACEdEose0cBAAfVsPyZBCWmZCswAmjYZAOsLNZAveEhS0WGLHjDfDR5yGqAGLr54u25rxEZB69coogswvrGZARXaYDsIcuIgMgZBIej93tPxjbUQXIryp87mK7FCoKHIsFXWhbqt3cVyQMaBxEREvzOPYK26m0Y7qkXCKFzvzsY7ciLXCX78kMiist3V7KKNEZD";

FB.setAccessToken(my_token);
var urls = [];
var count = 1;
var i = 0;
var j = 0;
var album_name = argv.album || "Timeline Photos";
var page_name = argv.pages || "me";
var since_date = argv.since_date || "2017-06-01";
var upload_cloudinary = argv.upload_cloudinary || false;
var download_locally = argv.download_locally || false;

console.log("album_name="+album_name);
console.log("page_name="+page_name);
console.log("since_date="+since_date);
console.log("download_locally="+download_locally);
console.log("upload_cloudinary="+upload_cloudinary);


function downloadLoop(urls) {
            for(i;i<urls.length;i++){
                if (download_locally) {
                  request(urls[i]).pipe(fs.createWriteStream('img/'+page_name+'_'+since_date+'_'+(i+1)+'.jpg')).on('finish', function(response) {
                      console.log("Download Completed : "+(++j)+'/'+i);
                    });
                }
                if (upload_cloudinary) {
                  console.log("Upload cloudinary");
                  cloudinary.uploader.upload(urls[i], function(result) {console.log(result)},{use_filename:true, folder: 'anti_vasco', phash: 'true'});
                }
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
        //var nextPage = '/'+data.id+'/photos?fields=source,created_time&since='+since_date;
        var nextPage = '/'+data.id+'/photos';

        FB.api(nextPage, 'get', {"fields":"created_time,source","since":since_date},function (response){
            console.log("Images quantity:"+response.data.length);
            for (var i = 0; i < response.data.length; i++) {
                urls.push(response.data[i].source);
            }
             //console.log("Getting images... Total Images Found : "+ urls.length);
             if(response.paging && response.paging.next) {
                download(response.paging.next);
             } else {
                 downloadLoop(urls);
             }
        });
    });
