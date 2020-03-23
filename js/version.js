var version = '';

(function () {
    if (version) {
        $.ajax({
            url: 'https://api.github.com/repos/' + githubOwnerRepo + '/releases/latest',
            cache: false,
            timeout: 5000,
            success: function (resp) {
                if (resp.tag_name !== version && resp.assets && resp.assets.length > 0) {
                    var body = resp.body.replace('\n', '<br>');
                    var asset = resp.assets[0];
                    layer.confirm(
                        '当前版本 <b>' + version + '</b>，最新版本 <b>' + resp.tag_name + '</b><br>' +
                        '更新大小 <b>' + (asset.size / 1024).toFixed(3) + '</b> KB' +
                        '<hr>更新说明：<br>' + body,
                        {
                            btn: ['立即下载', '稍后提示'],
                            yes: function (i) {
                                layer.close(i);
                                window.open(asset.browser_download_url);
                            },
                            btn2: function (i) {
                                layer.close(i);
                            }
                        }
                    );
                }
            }
        });
    }
})();
