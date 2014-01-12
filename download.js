var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var request = require('request');
var sc = require('./scrapper');

async.waterfall([
    setup,
    start,
    readLinks,
    createDirectory,
    download
]);

function setup(callback) {
    sc.setup(function (optimist) {
        optimist
        .usage([
            'Usage $0 FILE -o [DIRECTORY]',
            'If no file argument is specified, the standard input is used.'
        ].join('\n'))
        .describe('o', 'output directory');
        
        callback(null);
    });
}

function start(callback) {
    sc.start(function (filename, argv) {
        var outDir, q;
        
        if ( ! filename) {
            sc.help();
        }
        
        outDir = argv.o || '';
        
        callback(null, filename, outDir);
    });
}

function readLinks(filename, outDir, callback) {
    var title, links;
    
    title = path.basename(filename, '.json');
    links = fs.readFileSync(filename, 'utf8');
    links = links && JSON.parse(links);
    
    outDir = path.join(path.resolve(__dirname, outDir), title);
    
    if ( ! links) {
        callback(new Error('Bad file'));
    } else {
        callback(null, links, outDir);
    }
}

function createDirectory(links, outDir, callback) {
    mkdirp(outDir, function (error) {
        callback(error, links, outDir);
    });
}

function download(links, outDir, callback) {
    var q;
    
    q = async.queue(worker, 8);
    q.push(links);
    q.drain = drain;
    
    function worker(task, callback) {
        var options = {
            url: task.link,
            encoding: null
        };
        
        request(options, function (error, response, body) {
            var filename, statusCode;
            
            if (error) {
                callback(error);
                return;
            }
            
            filename = path.join(outDir, task.title.substr(0, 251)) +'.pdf';
            statusCode = response.statusCode;
            
            if (statusCode === 200) {
                fs.writeFile(filename, body, function (error) {
                    if (error) {
                        console.error(error);
                    }
                    callback(error);
                });
            } else {
                callback(new Error('Response status code is '+ statusCode));
            }
        });
    }
    
    function drain() {
        callback(null);
    }
}

