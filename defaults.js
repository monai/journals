var async = require('async');

module.exports = {
    archiveSetup: archiveSetup,
    archiveStart: archiveStart,
    issueSetup: issueSetup,
    issueStart: issueStart
};


function archiveSetup(optimist) {
    optimist
    .usage([
        'Usage $0 URL -o [DIRECTORY]',
        'If no url argument is specified, the standard input is used.'
    ].join('\n'));
}

function archiveStart(sc, callback) {
    return function (url, argv) {
        if ( ! url) {
            sc.help();
        }
        
        sc.scrape(url, callback);
    };
}

function issueSetup(optimist) {
    optimist
    .usage([
        'Usage $0 JSON -o [DIRECTORY]',
        'If no json argument is specified, the standard input is used.'
    ].join('\n'))
    .describe('o', 'output directory');
}

function issueStart(sc, callback) {
    return function (issues, argv) {
        var outDir, q;
        
        if ( ! issues) {
            sc.help();
        }
        
        issues = JSON.parse(issues);
        outDir = argv.o || '';
        
        q = async.queue(worker, 8);
        q.push(issues);
        
        function worker(task, workerCallback) {
            sc.scrape(task.link, function (error, window) {
                if (error) {
                    workerCallback(error);
                    return;
                }
                
                callback({
                    window: window,
                    title: task.title,
                    outDir: outDir
                }, workerCallback);
            });
        }
    };
}

