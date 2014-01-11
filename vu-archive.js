var sc = require('./scrapper');

sc.setup(sc.defaults.archiveSetup);
sc.start(sc.defaults.archiveStart(sc, onWindow));

function onWindow(error, window) {
    var $, $items, out, link;
    
    if (error) throw error;
    
    $ = window.$;
    $items = $('#sidebar-left ul.menu li a');
    
    out = [];
    $items.each(function (i) {
        var $this;
        
        $this = $(this);
        link = this.href;
        
        out.push({
            title: sc.slugify($this.text()),
            link: link
        });
    });
    
    sc.log(out);
};
