var sc = require('./scrapper');

sc.setup(sc.defaults.archiveSetup);
sc.start(sc.defaults.archiveStart(sc, onWindow));

function onWindow(error, window) {
    var $, $a, out, link;
    
    if (error) throw error;
    
    $ = window.$;
    $a = $('#issues h4 a');
    
    out = [];
    $a.each(function (i) {
        var $this;
        
        $this = $(this);
        link = this.href;
        if ( ! link.match(/\/showToc$/)) {
            link += '/showToc';
        }
        
        out.push({
            title: sc.slugify($this.text()),
            link: link
        });
    });
    
    sc.log(out);
};
