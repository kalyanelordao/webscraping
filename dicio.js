var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

/*
search = {
    word: string,
    page: int
}
*/

/*http://www.portaldalinguaportuguesa.org/advanced.php?
&show=list
&action=search
&act=advanced
&restrict=SUB
&start=150*/

const data = [];
const nouns = [];
const empty = [];
// var words = ['alca', 'acao', 'manga', 'pessoal', 'carro'];

function searchDicio(search, callback)
{
    const word = search.word;

    request(
        { url: search.address, encoding: 'binary' },
        function(err, resp, body)
        {
            if (!err && resp.statusCode == 200)
            {
                const $ = cheerio.load(body);

                if ($('#content h1.norp').length == 0)
                {
                    let type = $($('#content .cl')[0]).text();
                    callback(null, { word: word, result: type });
                }
                else
                {
                    const results = $('ul.resultados li a');
                    const words = [];

                    for (let i = 0; i < results.length; i++)
                    {
                        words.push({
                            word: $(results[i]).text(),
                            address: $(results[i]).attr('href')
                        });
                    }

                    callback(null, words);
                }
            }
            else callback(err || 'Status code ' + resp.statusCode);
        }
    );
}

function readFile()
{
    fs.readFile('words.txt', 'utf8', (err, data) => {
        if (!err)
        {
            const words = data.split('\r\n');
            console.log('words', words);
            searchWords(words);
        }
    });
}

readFile();

// searchWords(words);

function extractResult(results)
{
    var similarWords = [];

    for(let i in results)
    {
        if (results[i].length === undefined)
        {
            if (results[i].result === '')
                empty.push(results[i].word);
            
            else if (filter(results[i].result))
                nouns[results[i].word] = results[i].result;

            else
                data[results[i].word] = results[i].result;
        }
        else
        {
            similarWords = similarWords.concat(results[i]);
        }
    }

    return similarWords;
}

function logData()
{
    console.log('data', data);
    console.log('nouns', nouns);
    console.log('empty', empty);
}

function searchWords(words)
{
    const toSearch = [];

    for (let w in words)
    {
        toSearch.push({
            word: words[w],
            address: 'https://www.dicio.com.br/pesquisa.php?q=' + encodeURIComponent(words[w])
        });
    }

    async.map(toSearch, searchDicio, function(err, results) {
        if(!err)
        {
            const similarWords = extractResult(results);

            if (similarWords.length > 0)
                searchSimilarWords(similarWords);
            else
                logData();
        }
    });
}

function searchSimilarWords(similarWords)
{
    const toSearch = []

    for (let i in similarWords)
    {
        if (data[similarWords[i].words] === undefined)
        {
            toSearch.push({
                word: similarWords[i].word,
                address: 'https://www.dicio.com.br' + similarWords[i].address
            })
        }
    }

    async.map(toSearch, searchDicio, function(err, results) {
        if(!err)
        {
            extractResult(results);
            logData();
        }
    });
}

function filter(type) {
    return type === 's.f.' || type === 's.m.';
}