var sc = require('./scrapper');

sc.setup(sc.defaults.issueSetup);
sc.start(sc.defaults.issueStart(sc, onWindow));

function onWindow(data, callback) {
    var win, doc, $, $articles, $titles, $authors, $links;
    var title, author, link;
    var l, items, filename;
    
    win = data.window;
    doc = win.document;
    $ = win.$;
    $articles = $('.tocArticle');
    $titles =  $articles.find('.tocTitle');
    $authors =  $articles.find('.tocAuthors');
    $links =  $articles.find('.tocGalleys');
    
    l = $titles.length;
    if ((l | $authors.length | $links.length) !== l || l === 0) {
        callback(new Error('Bad element count'));
        return;
    }
    
    items = [];
    while (l--) {
        author = $($authors.get(l)).text();
        title = $($titles.get(l)).text();
        link = $($links.get(l)).find('a').get(0);
        link = link && link.href.replace('/article/view/', '/article/download/')
        
        items.push({
            title: sc.slugify(author +'-'+ title),
            link: link
        });
    }
    
    sc.writeJSON(data, items, callback);
};
