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
    var win, doc, $, $font;
    var l, items, filename;
    
    win = data.window;
    doc = win.document;
    $ = win.$;
    $font = $('#text font');
    
    items = [];
    $font.each(function (i) {
        var $this, title;
        
        $this = $(this);
        title = $this.text();
        link = $this.nextAll('a').get(0);
        
        if (link) {
            items.push({
                title: sc.slugify(title),
                link: link.href
            });
        }
    });
    
    filename = path.join(data.outDir, util.format('%s.json', data.title));
    fs.writeFile(filename, JSON.stringify(items), function (error) {
        callback(error);
    });
};

