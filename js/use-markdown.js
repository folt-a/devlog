(async function () {
    const result = await fetchAPI('./articles/zenntest.md', null, 'get');

    document.getElementById('article1').innerHTML =
        marked(result);
})();


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
            });
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
        });
}
