var sc = require('./scrapper');

sc.getParam(function (url) {
    sc.scrape(url, onWindow);
});

function onWindow(error, window) {
    if (error) throw error;
    
    var $ = window.$;
    var $a = $('#text a');
    
    var out = [];
    var href;
    $a.each(function (i) {
        href = this.href;
        if ( ! ~href.indexOf('dwn')) {
            out.push(this.href);
        }
    });
    
    sc.log(out);
    
    process.exit(0);
};
