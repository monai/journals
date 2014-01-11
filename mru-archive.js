var sc = require('./scrapper');

sc.setup(sc.defaults.archiveSetup);
sc.start(sc.defaults.archiveStart(sc, onWindow));

function onWindow(error, window) {
    var $, $a, out, link
    
    if (error) throw error;
    
    $ = window.$;
    $a = $('#text a');
    
    out = [];
    $a.each(function (i) {
        var $this = $(this);
        
        link = this.href;
        if ( ! ~link.indexOf('dwn')) {
            out.push({
                title: sc.slugify($this.prevAll('font').text()),
                link: link
            });
        }
    });
    
    sc.log(out);
};
