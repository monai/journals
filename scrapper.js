var fs = require('fs');
var path = require('path');
var util = require('util');
var optimist = require('optimist');
var request = require('request');
var jsdom = require('jsdom');
var unidecode = require('unidecode');
var mkdirp = require('mkdirp');
var defaults = require('./defaults');

var argv;

module.exports = {
    setup: setup,
    start: start,
    help: help,
    scrape: scrape,
    writeJSON: writeJSON,
    log: log,
    slugify: slugify,
    
    defaults: defaults
};

function setup(callback) {
    argv = optimist.argv;
    optimist.describe('h', 'print this help');
    callback(optimist);
    
    if (argv.h) {
        help();
    }
}

function start(callback) {
    getParam(function (param) {
        callback(param, argv);
    })
}

function help() {
    console.log(optimist.help());
    process.exit(0);
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

function writeJSON(options, data, callback) {
    var filename;
    
    filename = path.resolve(__dirname, options.outDir);
    mkdirp(filename, function (error) {
        filename = path.join(filename, util.format('%s.json', options.title));
        fs.writeFile(filename, JSON.stringify(data), function (error) {
            if (callback) {
                callback(error);
            }
        });
    });
}

function log(obj) {
    console.log(JSON.stringify(obj));
}

function slugify(str) {
    var out, re, i, l, stri;
    
    re = /[§\-=±!@#\$%\^&\*\(\)_\+`~\[\]{};'\\:\"\|,\./<>\?\s\u2010-\u28ff]/;
    str = str.toLowerCase()
    str = str.split(re);
    
    out = [];
    for (i = 0, l = str.length; i < l; i++) {
        stri = str[i];
        if (stri) {
            out.push(stri);
        }
    }
    
    return unidecode(out.join('-'));
}

function getParam(callback) {
    var isTTY, param;
    
    isTTY = !! process.stdin.isTTY;
    param = optimist.argv._[0] || null;
    
    if ( ! isTTY && ! param) {
        readStdin(callback);
    } else {
        callback(param);
    }
}

function readStdin(callback) {
    var stdin, out;
    
    stdin = process.stdin;
    out = '';
    
    stdin.setEncoding('utf8');
    stdin.on('readable', onReadable);
    stdin.on('end', onEnd);
    
    function onReadable() {
        var data = stdin.read();

        if (data !== null) {
            out += data;
        }
    }
    
    function onEnd() {
        callback(out);
    }
}

