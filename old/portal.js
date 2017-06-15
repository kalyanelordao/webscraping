var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    utf8 = require('utf8');

function searchPortal(from, callback)
{
    if (from >= 45000) return callback();
    const url = 'http://www.portaldalinguaportuguesa.org/advanced.php?&show=list&action=search&act=advanced&restrict=SUB&start=' + from;

    request(
        { url: url, encoding: 'binary' },
        function(err, resp, body)
        {
            if (!err && resp.statusCode == 200)
            {
                const $ = cheerio.load(body);

                const pageInfo = $('#maintext p i').text().split(' ');
                const next = parseInt(pageInfo[3]);
                const total = parseInt(pageInfo[5].substring(0, pageInfo[5].length - 1));

                const words = $('#maintext p table tr');
                const result = [];

                for (let i = 0; i < words.length; i++)
                {
                    let word = $(words[i].children[2]).text();
                    word = word.substring(0, word.length - 1);

                    try {
                        word = utf8.decode(word);
                    } catch (error) {
                        console.log('Could not decode the word ' + from + ' + ' + i + ':', word);
                    }

                    data.push({
                        word: word,
                        type: $(words[i].children[0]).text()
                    })
                }

                if (next < total) searchPortal(next, callback);
                else callback();
            }
            else console.log('Error', err);
        }
    );
}

function save()
{
    console.log('Saving ' + data.length + ' words!');
    fs.writeFile('result.json', JSON.stringify(data), function(err) {
        console.log(err ? 'Error: ' + err : 'Success!');
        console.log('Time:', (new Date().getTime() - time) / 1000);
    }); 
}

const time = new Date().getTime();

const data = [];
searchPortal(0, save);