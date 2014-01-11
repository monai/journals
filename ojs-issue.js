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
    var title, author, link;
    var l, items, filename;
    
    win = data.window;
    doc = win.document;
    $ = win.$;
    $articles = $('.tocArticle');
    $titles =  $articles.find('.tocTitle');
    $authors =  $articles.find('.tocAuthors');
    $links =  $articles.find('.tocGalleys');
    
    l = $titles.length;
    if ((l | $authors.length | $links.length) !== l || l === 0) {
        callback(new Error('Bad element count'));
        return;
    }
    
    items = [];
    while (l--) {
        author = $($authors.get(l)).text();
        title = $($titles.get(l)).text();
        link = $($links.get(l)).find('a').get(0);
        link = link && link.href.replace('/article/view/', '/article/download/')
        
        items.push({
            title: sc.slugify(author +'-'+ title),
            link: link
        });
    }
    
    filename = path.join(data.outDir, util.format('%s.json', data.title));
    fs.writeFile(filename, JSON.stringify(items), function (error) {
        callback(error);
    });
};
