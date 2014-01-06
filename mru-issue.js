var fs = require('fs');
var util = require('util');
var sc = require('./scrapper');

sc.getParam(function (urls) {
    urls = JSON.parse(urls);
    
    urls.forEach(function (url) {
        sc.scrape(url, onWindow);
    });
});

function onWindow(error, window) {
    if (error) throw error;
    
    var $ = window.$;
    var $font = $('#text font');
    
    var title;
    var items = {};
    var current;
    
    $font.each(function (i) {
        var $this = $(this);
        var _title = $this.text();
        var link;
        
        if (i === 0) {
            title = sc.slugify(_title);
            // current = items[title] = [];
            current = items = [];
            console.log(title);
        } else {
            link = $this.nextAll('a').get(0);
            
            if (link) {
                current.push({
                    title: sc.slugify(_title),
                    link: link.href
                });
            }
        }
    });
    
    var filename = util.format('links/%s.json', title);
    fs.writeFileSync(filename, JSON.stringify(items));
}

