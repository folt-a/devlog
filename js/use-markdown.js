(async function () {
    // config load
    const config = JSON.parse(await fetchAPI('./js/article-config.json', null, 'get'));

    const articleElms = document.querySelectorAll('article');

    // 記事要素にMarkdown記事を流し込む
    let elmIndex = 0;
    for (let articleIndex = 0; elmIndex < config.topArticleCounts; articleIndex++) {
        const article = config.articles[articleIndex];
        const publishedDate = dayjs(article.publishedDate, 'YYYYMMDD');

        //非公開記事、予約投稿記事は表示しない。
        if (article.isPublished && publishedDate <= dayjs()) {
            // 本文
            articleElms[elmIndex].querySelector('[data-article]').innerHTML = marked(await getArticleBody(article));

            // タイトル
            articleElms[elmIndex].querySelector('[data-title]').innerHTML = article.title;

            // 公開日時
            articleElms[elmIndex].querySelector('[data-published-date]').innerHTML = publishedDate.format('YYYY年MM月DD日');

            ++elmIndex;
        } else {
            ++articleIndex;
        }
    }
})()


/**
 * Markdown記事の最初の---から2度目の---を取り除き、
 * 記事本文をgetAPIで取得する
 * @param {Object} article 記事オブジェクト (config.articles)
 */
async function getArticleBody(article) {
    let result = await fetchAPI('./articles/' + article.title + '.md?' + article.updatedDate, null, 'get');
    result = result.replace(/---/i, "");
    const indexs = result.indexOf('---');
    const honbun = result.substr(indexs + 4, result.length);
    return honbun;
}

// API
async function fetchAPI(url, formData, method = 'post') {
    // 4xx系, 5xx系のエラーをさばくハンドラ
    var handleErrors = function (response) {

        // 404ならnullを返す
        if (response.status === 404) {
            return null;
        }
        // 4xx系, 5xx系エラーのときには response.ok==false になる
        else if (!response.ok) {
            return response.json().then(function (err) {
                throw new ApplicationError(err.code, err.message);
            })
        } else {
            return response;
        }
    }

    return await fetch(url, {
            method: method.toUpperCase(),
            body: formData
        })
        .then(handleErrors)
        .then(response => {
            if (response == null) {
                return null;
            }
            return response.text();
        })
        .catch(error => {
            return error;
        })
}
