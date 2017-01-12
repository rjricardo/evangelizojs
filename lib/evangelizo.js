const http = require('http');
const cheerio = require('cheerio');
const _ = require('lodash');
const dateformat = require('dateformat');
const Promise = require('promise');

const TYPEOPTIONS = [
    'saint',
    'feast',
    'liturgic_t',
    'reading_lt',
    'reading_st',
    'reading',
    'all',
    'comment_t',
    'comment_a',
    'comment_s',
    'comment'
];

const LANGOPTIONS = [
    'AM',
    'AR',
    'DE',
    'FR',
    'GR',
    'IT',
    'MG',
    'NL',
    'PL',
    'PT',
    'SP',
    'ARM',
    'BYA',
    'MAA',
    'TRF',
    'TRA'
];

const CONTOPTIONS = [
    'FR',
    'SR',
    'PS',
    'GSP',
    'EP'
];

EvangelizoException = function(message) {
    this.message = message;
    this.name    = "EvangelizoException";
};

const HOST = 'feed.evangelizo.org';
const PATH = '/v2/reader.php';

var options = {
    host: 'feed.evangelizo.org',
    path: '/v2/reader.php?date=20170108&type=reading_lt&lang=SP&content=GSP'
};

createUrl = function(opts) {
    /*
     * Date is mandatory, so check if it is present
     */
    if (!opts.date)
    {
        throw new EvangelizoException("Date is necessary");
    }

    /*
     * Type is mandatory, so check if it is present
     */
    if (!opts.type)
    {
        throw new EvangelizoException("Type is necessary");
    }
    else
    {
        /*
         * If present, must be one of the allowed types
         */
        if (!_.includes(TYPEOPTIONS, opts.type))
        {
            throw new EvangelizoException("Type must be one of: " + _.toString(TYPEOPTIONS));
        }
    }

    /*
     * Lang is necessary, so check if it is present
     */
    if (!opts.lang)
    {
        throw new EvangelizoException("Lang is necessary");
    }
    else
    {
        /*
         * If present, must be one of allowed langs
         */
        if (!_.includes(LANGOPTIONS, opts.lang))
        {
            throw new EvangelizoException("Lang must be one of: " + _.toString(LANGOPTIONS));
        }
    }

    /*
     * Create url path
     */
    var path = PATH;

    /*
     * Format date and add to path
     */ 
    formattedDate = dateformat(opts.date, 'yyyymmdd');
    path += '?date=' + formattedDate; 

    /*
     * Add type
     */
    path += '&type=' + opts.type;

    /*
     * Add lang
     */
    path += '&lang=' + opts.lang;

    /*
     * Check for content option and add
     */
    if (opts.content)
    {
        path += '&content=' + opts.content;
    }

    return path;
};

checkGetOpts = function(getOpts) {
    if (typeof getOpts === 'undefined')
    {
        getOpts = {
            date: Date.now(),
            lang: 'AM'
        };
    }
    else
    {
        if (typeof getOpts.date === 'undefined') { getOpts.date = Date.now(); }
        if (typeof getOpts.lang === 'undefined') { getOpts.lang = 'AM'; }
    }
    return getOpts;
}

makeRequest = function(getOpts) {
    let reqUrl = createUrl(getOpts);
    let reqOpts = {
        host: HOST,
        path: reqUrl
    };
    return new Promise(function(resolve, reject) {
        http.request(reqOpts, function(res) {
            if (res.statusCode !== 200)
            {
                reject(err);
            }
            else {
                var str = '';
                res.on('data', function(chunk) {
                    str += chunk;   
                });

                res.on('end', function() {
                    str = _.split(str, '<br /><br />', 1)[0];
                    $ = cheerio.load(str, { normalizeWhitespace: true });
                    str = $.text();
                    resolve(str);
                });
            }
        }).end();
    });
}

exports.getSaint = function(saintOptions) {
    saintOptions = checkGetOpts(saintOptions);

    saintOptions.type = 'saint';

    return makeRequest(saintOptions);
}

exports.getFeast = function(feastOptions) {
    feastOptions = checkGetOpts(feastOptions);

    feastOptions.type = 'feast';

    return makeRequest(feastOptions);
}

exports.getLiturgicTitle = function(ltOptions) {
    ltOptions = checkGetOpts(ltOptions);

    ltOptions.type = 'liturgic_t';

    return makeRequest(ltOptions);
}

exports.getReading = function(content, readingOptions) {
    if (typeof content === 'undefined' || !_.includes(CONTOPTIONS,content))
    {
        throw new EvangelizoException("Parameter content should be one of: " + _.toString(CONTOPTIONS));
    }

    readingOptions = checkGetOpts(readingOptions);

    readingOptions.type = 'reading';
    readingOptions.content = content;

    return makeRequest(readingOptions);
}

exports.getReadingLt = function(content, readingOptions) {
    if (typeof content === 'undefined' || !_.includes(CONTOPTIONS,content))
    {
        throw new EvangelizoException("Parameter content should be one of: " + _.toString(CONTOPTIONS));
    }

    readingOptions = checkGetOpts(readingOptions);

    readingOptions.type = 'reading_lt';
    readingOptions.content = content;

    return makeRequest(readingOptions);
}

exports.getReadingSt = function(content, readingOptions) {
    if (typeof content === 'undefined' || !_.includes(CONTOPTIONS,content))
    {
        throw new EvangelizoException("Parameter content should be one of: " + _.toString(CONTOPTIONS));
    }

    readingOptions = checkGetOpts(readingOptions);

    readingOptions.type = 'reading_st';
    readingOptions.content = content;

    return makeRequest(readingOptions);
}