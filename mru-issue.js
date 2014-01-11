var sc = require('./scrapper');

sc.setup(sc.defaults.issueSetup);
sc.start(sc.defaults.issueStart(sc, onWindow));

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
    
    sc.writeJSON(data, items, callback);
};
