var path = require('path');
var util = require('util');
var fs = require('fs');
var async = require('async');
var sc = require('./scrapper');

sc.setup(function (optimist) {
    optimist
    .usage([
        'Usage $0 JSON -o [DIRECTORY]',
        'If no json argument is specified, the standard input is used.'
    ].join('\n'))
    .describe('o', 'output directory');
});

sc.start(function (issues, argv) {
    var outDir, q;
    
    if ( ! issues) {
        sc.help();
    }
    
    issues = JSON.parse(issues);
    outDir = argv.o || '';
    
    q = async.queue(worker, 8);
    q.push(issues);
    
    function worker(task, callback) {
        sc.scrape(task.link, function (error, window) {
            if (error) {
                callback(error);
                return;
            }
            
            onWindow({
                window: window,
                title: task.title,
                outDir: outDir
            }, callback);
        });
    }
});

function onWindow(data, callback) {
    var win, doc, $, $articles, $titles, $authors, $links;
    var l, items, filename;
    
    win = data.window;
    doc = win.document;
    $ = win.$;
    $articles = $('.tocArticle');
    $titles =  $articles.find('.tocTitle');
    $authors =  $articles.find('.tocAuthors');
    $links =  $articles.find('.tocGalleys');
    
    l = $titles.length;
    if ((l | $authors.length | $links.length) !== l) {
        console.error('Elements count mismatch');
        process.exit(1);
    }
    
    items = [];
    while (l--) {
        items.push({
            title: sc.slugify($($authors.get(l)).text() +'-'+ $($titles.get(l)).text()),
            link: $($links.get(l)).find('a').get(0).href.replace('/article/view/', '/article/download/')
        });
    }
    
    filename = path.join(data.outDir, util.format('%s.json', data.title));
    fs.writeFile(filename, JSON.stringify(items), function (error) {
        callback(error);
    });
};
