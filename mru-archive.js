var sc = require('./scrapper');

sc.setup(function (optimist) {
    optimist
    .usage([
        'Usage $0 URL -o [DIRECTORY]',
        'If no url argument is specified, the standard input is used.'
    ].join('\n'));
});

sc.start(function (url, argv) {
    if ( ! url) {
        sc.help();
    }
    
    sc.scrape(url, onWindow);
});

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
