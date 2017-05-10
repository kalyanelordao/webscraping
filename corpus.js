const Promise = require('bluebird');
const request = require('request-promise');
const fs = Promise.promisifyAll(require('fs'));
const cheerio = require('cheerio');
const utf8 = require('utf8');

function search(cookie, words, data)
{
	// console.log('http://www.corpusdoportugues.org/web-dial/x3.asp?sample=1000&w11=' + words.splice(0, 1) + '&r=');
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/x3.asp?sample=1000&w11=' + words.splice(0, 1) + '&r=',
			resolveWithFullResponse: true
		})
		.then(resp => {
			console.log(resp);
		});
}

function login()
{
	return request({
			uri: 'http://www.corpusdoportugues.org/web-dial/',
			resolveWithFullResponse: true
		})
		.then(resp => 
{			console.log(resp.headers);
			return resp.headers['set-cookie'][0];
		})
		.then(cookie => {
			return request({
					uri: 'http://www.corpusdoportugues.org/web-dial/login.asp?email=kalyanelordao@gmail.com&password=kalylordao10&B1=Log+in&e=',
					resolveWithFullResponse: true,
					followAllRedirects: false,
					headers: { cookie: cookie }
				})
				.catch(error => {
					console.log('ERROR!', error.statusCode);
					throw error;
				})
				.then(resp => {
					return cookie;
				});
		});
}

login()
	.catch(error => {
		console.log(error);
	}).then(cookie => {
		search(cookie, ['casa']);
	})

/*const time = new Date().getTime();

const data = [];


searchPortal(0);
	.then(() => {
		console.log('Saving ' + data.length + ' words!');
		return fs.writeFile('result.json', JSON.stringify(data));
	})
	.catch(error => {
		console.log('Error', err);
	});*/