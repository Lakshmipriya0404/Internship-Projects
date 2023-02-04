import request from 'request-promise';
import { load } from 'cheerio';
import { writeFileSync } from 'fs';
import { Parser as json2csv } from 'json2csv';

const url = 'https://www.nature.com/articles/s41598-023-28880-x';
const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
}
let data = [];

/*Scrapes data*/
async function CollectData(){
    const response = await request({
        uri: url,
        header: headers,
        gzip: true,
    });
    let $ = load(response);
    let title = $('h1[class="c-article-title"]').text();
    let abstract = Cleanup($('#Abs1-content').text());
    let article = Cleanup($('div[class="main-content"]').text());
    let images = $("#tabpanel-figures li").length;
    let references_text = $('p[class="c-article-references__text"]').text();
    let references_links=[];
    $('p[class="c-article-references__links u-hide-print"]').each(function () {
        references_links.push($(this).find('a').attr('href'))
    });
    data.push({
        Title: title,Abstract: abstract,Article: article,
    });
    toCsv(data,'paper_stats');data=[];
    data.push({
        Reference_Text: references_text,References_Links :references_links,
    });
    toCsv(data,'references');
}

/*Stores data*/
function toCsv(data,name) {
    const j2cp = new json2csv();
    const csv = j2cp.parse(data);
    writeFileSync(`${name}.csv`,csv,"utf8");
}

/*Cleans the collected data*/
function Cleanup(data){
    return data.replace(/[0-9]/g, '').replace(/[^\w\s]/gi, '').replace(/^[\s,.;]+/, "").replace(/[\s,.;]+$/, "").split(/[\s,.;]+/).length;
}

CollectData();