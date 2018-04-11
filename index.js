const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './ffie.csv',
    header: [
        { id: 'name', title: 'COMPANY NAME' },
        { id: 'email', title: 'EMAIL' },
        { id: 'naf', title: 'NAF' },
        { id: 'contact', title: 'contact' },
        { id: 'address', title: 'ADDRESS' },
        { id: 'phone', title: 'PHONE' },
    ]
});

const records = [
];

const maxFfie = 435;

for (let i = 0; i <= maxFfie; i++) {

    ((page) => {
        setTimeout(() => {
            const ffieURL = `http://www.ffie.fr/trouver-un-professionnel/rechercher-un-electricien/?tx_saprofessionnel_pi1%5Bpointer%5D=${page}`;
            request(ffieURL, (err, res, body) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                if (res.statusCode === 200) {
                    const dom = new JSDOM(body);
                    const $ = (require('jquery'))(dom.window);
                    const rows = $('.inner3 tr');
                    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                        const row = $(rows[rowIndex]);
                        const href = $(row.find('a')).attr('href');
                        const name = $(row.find('a')).text();
                        if (href) {
                            request(href, (err, res, body) => {
                                if (err) {
                                    console.error(err);
                                    process.exit(1);
                                }
                                if (res.statusCode === 200) {
                                    const dom = new JSDOM(body);
                                    const $ = (require('jquery'))(dom.window);
                                    const company = {
                                        name,
                                        email: $('.inner2 a').text(),
                                        naf: $($('.inner2 td')[0]).text(),
                                        contact: $($('.inner2 td')[1]).text(),
                                        address: $($('.inner2 td')[2]).text(),
                                        phone: $($('.inner2 td')[3]).text(),
                                    }
                                    records.push(company);
                                    if (page === maxFfie) {
                                        csvWriter.writeRecords(records)       // returns a promise
                                            .then(() => {
                                                console.log('...Done');
                                                process.exit(0);
                                            });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }, i * 2500);
    })(i);
}
