const Promise = require('bluebird');
const request = require('request-promise');
const fs = Promise.promisifyAll(require('fs'));
const cheerio = require('cheerio');
const utf8 = require('utf8');
const iconv = require('iconv-lite');

function joinCookies(cookies) {
	return cookies.join('; ');
}

// x2.asp
function buildFormData(word) {
	return 'chooser=seq&isVC=n&whatdo=&whatdo1=&showHelp=&wl=4&wr=4&w1a=&p=' + word + '&posDropdown=Insert+PoS&w1b=&posWord2Dropdown=Insert+PoS&w2=&posColDropdown=Insert+PoS&submit1=Find+matching+strings&sec1=0&sec2=0&sortBy=freq&sortByDo2=freq&minfreq1=freq&freq1=10&freq2=0&numhits=100&kh=200&groupBy=words&whatshow=raw&saveList=no&ownsearch=y&changed=&word=&sbs=&sbs1=&sbsreg1=&sbsr=&sbsgroup=&redidID=&compared=&holder=&waited=y&user=&s1=0&s2=0&s3=0&perc=mi&r1=&r2=&didRandom=y'
}

function start()
{
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/',
			resolveWithFullResponse: true,
			headers: {
				connection: 'keep-alive'
			}
		})
		.then(resp => {
			return [ resp.headers['set-cookie'][0] ];
		})
		.catch(error => {
			console.log('start error', error.statusCode);
			throw error;
		});
}

function login(cookies)
{
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/login.asp?email=kalyanelordao@gmail.com&password=kalylordao10&B1=Log+in&e=',
			resolveWithFullResponse: true,
			followAllRedirects: false,
			headers: { cookie: joinCookies(cookies) }
		})
		.then(resp => {
			if (resp.headers['set-cookie'] && resp.headers['set-cookie'].length > 0)
				resp.headers['set-cookie'].forEach(cookie => {
					cookies.push(cookie);
				});

			return cookies;
		})
		.catch(error => {
			console.log('login error', error.statusCode);
			throw error;
		});
}

// x2.asp
function search(cookies, word)
{
	return request({
			method: 'POST',
			uri: 'http://www.corpusdoportugues.org/web-dial/x2.asp',
			resolveWithFullResponse: true,
			headers: {
				cookie: joinCookies(cookies),
				connection: 'keep-alive',
				'content-type': 'application/x-www-form-urlencoded',
				referer: 'http://www.corpusdoportugues.org/web-dial/x1.asp?w=1920&h=1080&c=port'
			},
			form: buildFormData(word)
		})
		.then(resp => {
			if (resp.headers['set-cookie'] && resp.headers['set-cookie'].length > 0)
				resp.headers['set-cookie'].forEach(cookie => {
					cookies.push(cookie);
				});

			return cookies;
		})
		.catch(error => {
			console.error('search error', error.statusCode);
			throw error;
		});
}

function enter(cookies, word)
{
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/x3.asp?xx=1&w11=' + word + '&r=',
			resolveWithFullResponse: true,
			encoding: null,
			headers: {
				cookie: joinCookies(cookies),
				connection: 'keep-alive',
				referer: 'http://www.corpusdoportugues.org/web-dial/x2.asp'
			}
		})
		.then(resp => {
			return resp.body;
		})
		.catch(error => {
			console.error('enter error', error.statusCode);
			throw error;
		});
}

function parse(data)
{
	const $ = cheerio.load(data);
	const sentences = [];

    for (let id = 1;; id++)
    {
        const element = $('#t' + id + ' td:last-of-type');
        if (element.length === 0) break;

        var sentence = $(element[0]).text();
        try {
            sentence = iconv.encode(sentence, 'utf-8').toString();
        } catch (error) {
            console.error('Could not decode the sentence at ' + id + ':', sentence);
        }

        sentences.push(sentence);
    }

    return sentences;
}

start()
	.then(login)
	.then(cookies => {
		return search(cookies, 'casa');
	})
	.then(cookies => {
		return enter(cookies, 'casa');
	})
	/*.then(iconv.decodeStream('win1252'))
	.then(decoded => {
		return decoded.toString('utf-8');
	})*/
	.then(parse)
	.then(sentences => {
		console.log(sentences);
	})
	.catch(error => {
		console.log('Error', error);
	});