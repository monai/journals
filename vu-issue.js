var path = require('path');
var util = require('util');
var async = require('async');
var sc = require('./scrapper');

sc.setup(sc.defaults.issueSetup);
sc.start(sc.defaults.issueStart(sc, onWindow));

function onWindow(data, callback) {
    var win, doc, $, $items, titleClass;
    var title, author, link, doPush;
    var items, filename, q;
    
    win = data.window;
    doc = win.document;
    $ = win.$;
    
    $items = $('.itemFullText .header_style, .itemFullText .author_style');
    titleClass = 'header_style';
    if ($items.length === 0) {
        $items = $('.itemList .catItemTitle, .itemList .catItemAuthor');
        titleClass = 'catItemTitle';
    }
    
    items = [];
    $items.each(function (i) {
        var $this, $link;
        
        $this = $(this);
        
        if ($this.hasClass(titleClass)) {
            if (doPush) {
                push();
            }
            
            title = $this.text();
            link = $this.get(0);
            link = link && link.href;
            
            if ( ! link) {
                link = $this.find('a').get(0);
                link = link && link.href;
            }
            
            doPush = true;
        } else {
            author = $this.text();
            push();
        }
        
        function push() {
            if ( ! link) {
                console.error(util.format('Missing link on "%s" at "%s"', title, data.title));
                return;
            }
            
            items.push({
                title: sc.slugify(author +'-'+ title),
                link: link
            });
        
            doPush = false;
            author = '';
            title = '';
        }
    });
    
    q = async.queue(worker, 8);
    q.push(items);
    q.drain = function () {
        sc.writeJSON(data, items, function (error) {
            callback(error);
        });
    };
    
    function worker(task, callback) {
        var link;
        
        sc.scrape(task.link, function (error, window) {
            if (error) {
                callback(error);
                return;
            }
            
            link = window.$('.itemFullText .download a').get(0);
            task.link = link && link.href;
            
            callback(null);
        });
    }
};
