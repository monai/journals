1. git clone
2. `cd journals`
3. `node vu-archive.js http://www.vu.lt/leidyba/lt/mokslo-zurnalai/knygotyra/archyvas | node vu-issue.js -o links`
4. `ls links | xargs -I{} node download.js links/{}`
5. ????
6. PROFIT
