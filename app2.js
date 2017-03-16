var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async');

/*
search = {
    word: string,
    page: int
}
*/
function searchDicio(search, cb){
    const word = search.word;
    const url = 'https://www.dicio.com.br/pesquisa.php?q=' + encodeURIComponent(word);

    //console.log('url:', url)

    request({url: url, encoding: 'binary'}, 
        function(err, resp, body){
        if(!err && resp.statusCode == 200){
            var $ = cheerio.load(body), capture = [];
            
            function textGetter(){
                var titulo = $(this).text();
                if(titulo.search(new RegExp(word, 'i')) >= 0)
                    capture.push(titulo); 
            }
            $('#ires a').each(textGetter);
            $('#ires .st').each(textGetter);
            cb(null, {word: word, result: capture});
        }
        else cb(err);
    });
}

var words = ['pessoal', 'casa', 'são', 'caminho', 'cedo'];
var searchs = [];

for (let w in words) {
    for (let page = 0; page < 5; page++)
    {
        searchs.push({
            word: words[w],
            page: page
        });
    }
}

if (false) async.map(searchs, searchGoogle, function(err, resultados){
    if(!err){
        console.log('GOOGLE');

        for(let i in resultados)
            //console.log(resultados[i]);
            console.log(resultados[i].word, resultados[i].result.length);
    }
}); 
