var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var request = require('request');
var sc = require('./scrapper');

var OUT_BASE = 'out';

async.waterfall([
    getLinkList,
    createDirectory,
    download,
    end
]);

function getLinkList(callback) {
    sc.getParam(function (file) {
        var base, links;
        
        base = path.basename(file, '.json');
        links = fs.readFileSync(file, 'utf8');
        links = links && JSON.parse(links);
        
        if ( ! links) {
            callback(new Error('Bad file'));
        } else {
            callback(null, base, links);
        }
    });
}

function createDirectory(base, links, callback) {
    base = path.join(OUT_BASE, base);
    mkdirp(base, function (error) {
        callback(error, base, links);
    });
}

function download(base, links, callback) {
    var q;
    
    q = async.queue(worker, 8);
    q.push(links);
    q.drain = drain;
    
    function worker(task, callback) {
        get(task, callback);
    }
    
    function drain() {
        callback(null);
    }
    
    function get(task, callback) {
        var options = {
            url: task.link,
            encoding: null
        };
        
        request(options, function (error, response, body) {
            if (error) throw error;
            
            var filename = path.join(base, task.title) +'.pdf';
            var statusCode = response.statusCode;
            
            console.log(options.url);
            
            if (statusCode === 200) {
                fs.writeFile(filename, body, function (error) {
                    callback(error);
                });
            } else {
                callback(new Error('Response status code is '+ statusCode));
            }
        });
    }
}

function end() {
    process.exit(0);
}

