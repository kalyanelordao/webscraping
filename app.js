const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Corpus = require('./corpus').Corpus;

const file = fs.readFileSync('homonyms.txt', 'utf8');
const words = file.split('\n');

words.forEach((word, index) => {
	word = word.trim();
	words[index] = word.substr(0, word.length - 1).replace('_', ' ').toLowerCase();
});

const corpus = new Corpus();

//.login('kalyanelordao@gmail.com', 'kalylordao10')
// words.forEach(async function (word, index) {

async function getSentences()
{
	const data = {};

	for (let i in words)
	{
		if (i >= 1) break;
		const word = words[i];

		try {
			console.log('Request', word);
			data[word] = await corpus.search(word, 1000);
			console.log('Got', data[word].length, 'sentences from', word);
		}
		catch (error) {
			console.error('Could not query', word);
		}
	}

	try {
		fs.writeFileSync('data.json', JSON.stringify(data));;
		console.log('Saved at data.json');
	}
	catch (error) {
		console.error('Could not save at data.json');
	}
}

getSentences();


/*const c = require('./corpus');

c.start()
	/*.then(cookies => {
		return c.login(cookies, 'kalyanelordao@gmail.com', 'kalylordao10');
	})*
	.then(cookies => {
		return c.search(cookies, 'casa');
	})
	.then(searchCookies => {
		return c.enter(searchCookies, 'casa');
	})
	.then(response => {
		return c.enter(response.cookies, 'casa', 1000);
	})
	.then(response => {
		return c.extractSentences(response.data);
	})
	.then(console.log)
	.catch(error => {
		console.error('Error', error.response.body);
	});*/