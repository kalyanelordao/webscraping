const Promise = require('bluebird');
const request = require('request-promise');
const fs = Promise.promisifyAll(require('fs'));
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

function joinCookies(cookies) {
	return cookies.join('; ');
}

function buildFormData(word) {
	return 'chooser=seq&isVC=n&whatdo=&whatdo1=&showHelp=&wl=4&wr=4&w1a=&p=' + word + '&posDropdown=Insert+PoS&w1b=&posWord2Dropdown=Insert+PoS&w2=&posColDropdown=Insert+PoS&submit1=Find+matching+strings&sec1=0&sec2=0&sortBy=freq&sortByDo2=freq&minfreq1=freq&freq1=10&freq2=0&numhits=100&kh=200&groupBy=words&whatshow=raw&saveList=no&ownsearch=y&changed=&word=&sbs=&sbs1=&sbsreg1=&sbsr=&sbsgroup=&redidID=&compared=&holder=&waited=y&user=&s1=0&s2=0&s3=0&perc=mi&r1=&r2=&didRandom=y'
}

function updateCookies(currentCookies, newCookies)
{
	const cookies = currentCookies.splice(0);

	if (newCookies) newCookies.forEach(cookie => {
		if (cookies.indexOf(cookie) === -1)
			cookies.push(cookie);
	});

	return cookies;
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

function login(cookies, email, password)
{
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/login.asp?email=' + email + '&password=' + password + '&B1=Log+in&e=',
			resolveWithFullResponse: true,
			followAllRedirects: false,
			headers: { cookie: joinCookies(cookies) }
		})
		.then(resp => {
			return updateCookies(cookies, resp.headers['set-cookie']);
		})
		.catch(error => {
			console.log('login error', error.statusCode);
			throw error;
		});
}

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
			return updateCookies(cookies, resp.headers['set-cookie']);
		})
		.catch(error => {
			console.error('search error', error.statusCode);
			throw error;
		});
}

function enter(cookies, word, amount)
{
	const args = amount === undefined ? 'xx=1' : 'sample=' + amount;
	const tokens = word.split(' ');
	const words = tokens.length === 1 ? '&w11=' + word : '&w10=' + tokens[0] + '&w11=' + tokens[1];
	const uri = 'http://www.corpusdoportugues.org/web-dial/x3.asp?' + args + words + '&r=';

	console.log('URI', uri);

	return request({
			uri: uri,
			resolveWithFullResponse: true,
			encoding: null,
			headers: {
				cookie: joinCookies(cookies),
				connection: 'keep-alive',
				referer: 'http://www.corpusdoportugues.org/web-dial/x2.asp'
			}
		})
		.then(resp => {
			fs.writeFileSync('corpus_response.html', resp.body);
			return {
				cookies: updateCookies(cookies, resp.headers['set-cookie']),
				data: iconv.decode(resp.body, 'binary')
			};
		})
		.catch(error => {
			console.error('enter error', error.statusCode);
			throw error;
		});
}

function extractSentences(data)
{
	try {
		const $ = cheerio.load(data);
		const sentences = [];

	    for (let id = 1;; id++)
	    {
	        const element = $('#t' + id + ' td:last-of-type');
	        if (element.length === 0) break;
	        sentences.push($(element[0]).text());
	    }

	    return sentences;
	}
	catch (error) {
		console.error('extractSentences error', error);
		throw error;
	}
}

function Corpus()
{
	const self = this;

	self.started = false;
	self.cookies = [];

	function ensure()
	{
		if (!self.started)
		{
			return start()
				.then(cookies => {
					self.cookies = cookies;
					self.started = true;
				});
		}
		else return Promise.resolve();
	}

	self.login = function (email, password)
	{
		return ensure()
			.then(() => {
				return login(self.cookies, email, password);
			})
			.then(cookies => {
				self.cookies = cookies;
				return self;
			});
	}

	self.search = function (word, amount)
	{
		return ensure()
			.then(() => {
				return search(self.cookies, word);
			})
			.then(cookies => {
				self.cookies = cookies;
				return enter(self.cookies, word);
			})
			.then(response => {
				if (amount === undefined || amount <= 100)
					return response;
				else {
					self.cookies = response.cookies;
					return enter(self.cookies, word, amount);
				}
			})
			.then(response => {
				self.cookies = response.cookies;
				return extractSentences(response.data);
			});
	}
}

module.exports = {
	Corpus: Corpus,
	start: start,
	login: login,
	search: search,
	enter: enter,
	extractSentences: extractSentences
}

/* Test

const c = require('./corpus');

c.start()
	.then(cookies => {
		return c.login(cookies, 'kalyanelordao@gmail.com', 'kalylordao10');
	})
	.then(cookies => {
		return c.search(cookies, 'casa');
	})
	.then(searchCookies => {
		return c.enter(searchCookies, 'casa');
	})
	.then(response => {
		return c.extractSentences(response.data);
	})
	.then(console.log)
	.catch(error => {
		console.error('Error', error);
	});

	*/