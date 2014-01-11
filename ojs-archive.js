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
