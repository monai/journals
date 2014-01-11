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
