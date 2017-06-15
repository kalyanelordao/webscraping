var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async');

/*
search = {
	word: string,
	page: int
}
*/
/*function searchGoogle(search, cb){
	const word = search.word;
	const url = 'https://www.google.com.br/search?hl=pt-BR&gl=br&tbm=nws&authuser=0&q=' + encodeURIComponent(word) + '&start=' + (10 * search.page);

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


function searchBing(search, cb){
	const word = search;
	const url = 'http://www.bing.com/news/search?q=' + encodeURIComponent(word);
	
	request({url: url, encoding: 'binary'}, 
		function(err, resp, body){
		if(!err && resp.statusCode == 200){
			var $ = cheerio.load(body), capture = [];

			function textGetter(){
				var titulo = $(this).text();
				if(titulo.search(new RegExp(word, 'i')) >= 0)
					capture.push(titulo); 
			}
			$('.newsitem .caption a').each(textGetter);
			$('.newsitem .caption .snippet').each(textGetter);
			cb(null, {word: word, result: capture});
		}
		else cb(err);
	});
}

var words = ['pessoal', 'casa', 'são', 'caminho', 'cedo'];
var searchs = [];

if (false) async.map(words, searchBing, function(err, resultados){
	if(!err){
		console.log('BING');

		for(let i in resultados)
			console.log(resultados[i].word, resultados[i].result.length);
	}
});

function searchYahoo(search, cb){
	const word = search.word;
	const url = 'https://br.news.search.yahoo.com/search?p=' + encodeURIComponent(word) + '&b=' + (10 * search.page);

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
			$('.searchCenterMiddle .title a').each(textGetter);
			$('.searchCenterMiddle p').each(textGetter);
			cb(null, {word: word, result: capture});
		}
		else cb(err ? err : 'status != 200');
	});
}

var words = ['pessoal', 'casa', 'são','caminho', 'cedo'];
var searchs = [];

for (let w in words) {
	for (let page = 0; page < 60; page++)
	{
		searchs.push({
			word: words[w],
			page: page
		});
	}
}

if (false) for (let i = 0; i < searchs.length; i += 5)
{
	const sub = searchs.splice(0, 5);
	console.log('On i:', i);

	setInterval(function () {
		async.map(searchs, searchYahoo, function(err, resultados){
			if(!err){
				console.log('YAHOO');

				for(let i in resultados)
					console.log(resultados[i].word, resultados[i].result.length);
			}
		});
	}, (i / 5) * 1000);
} 
*/

function searchG1(search, cb){
	const word = search.word;
		const url = 'https://br.news.search.yahoo.com/search?p=' + encodeURIComponent(word) + '&b=' + (10 * search.page);

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
			$('.searchCenterMiddle .title a').each(textGetter);
			$('.searchCenterMiddle p').each(textGetter);
			cb(null, {word: word, result: capture});
		}
		else cb(err ? err : 'status != 200');
	});
}

var words = ['pessoal', 'casa', 'caminho', 'cedo', 'almoço', 'eu almoço', 'gosto', 'eu gosto'];
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

let i = -1;

console.log('searchs:', searchs.length);
while (searchs.length > 0)
{
	i++;

	const sub = searchs.splice(0, 5);
	console.log('On i:', i);

	//setInterval(function () {
		async.map(searchs, searchG1, function(err, resultados){
			if(!err){
				console.log('YAHOO');

				for(let i in resultados)
					console.log(resultados[i]);
					//console.log(resultados[i].word, resultados[i].result.length);
			}
			else {
				console.log('erro loko');
			}
		}, (i / 5) * 60000);
} 
