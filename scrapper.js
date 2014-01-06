var util = require('util');
var optimist = require('optimist');
var request = require('request');
var jsdom = require('jsdom');
var unidecode = require('unidecode');

module.exports = {
    getParam: getParam,
    scrape: scrape,
    log: log,
    slugify: slugify
};

function getParam(callback) {
    readStdin(function (data) {
        var param = data.length ? data : optimist.argv._[0];
        callback(param);
    });
}

function scrape(url, callback) {
    request(url, onRequest);
    
    function onRequest(error, response, body) {
        if (error) throw error;
        
        jsdom.env({
            html: body,
            url: url,
            scripts: [
                'http://code.jquery.com/jquery.js'
            ],
            done: onDOM
        });
    }
    
    function onDOM(error, window) {
        callback(error, window);
    }
}

function log(obj) {
    console.log(JSON.stringify(obj));
}

function slugify(str) {
    var out, strl, re, l;
    
    re = /[§\-=±!@#\$%\^&\*()_\+`~\[\]{};'\\:\"\|,\./<>\?\s\u2010-\u28ff]/;
    str = str.toLowerCase()
    str = str.split(re);
    
    out = [];
    l = str.length;
    while (l--) {
        strl = str[l];
        if (strl !== '') {
            out.push(strl);
        }
    }
    
    return unidecode(out.join('-'));
}

function readStdin(callback) {
    var stdin = process.stdin;
    var out = '';
    var count = 0;
    
    stdin.setEncoding('utf8');
    
    stdin.on('readable', onReadable);
    stdin.on('end', onEnd);
    
    function onReadable () {
        var data = stdin.read();
        
        if (data === null) {
            if (count === 0) {
                onEnd();
            }
        } else {
            out += data;
        }
        
        count++;
    }
    
    function onEnd() {
        callback(out);
    }
}

