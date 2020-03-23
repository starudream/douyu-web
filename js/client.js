function start() {
    ws = new WebSocket(douyuWSURL);

    ws.onopen = function () {
        initGift();
        layer.alert('房间号：' + R + '<br>弹幕等级：' + ML + '<br>礼物价值：' + GL + '<br>进入房间：' + UL);
        ws.send(encode({ 'type': 'loginreq', 'roomid': R }));
        ws.send(encode({ 'type': 'joingroup', 'rid': R, 'gid': '-9999' }));
        keep();
    };

    ws.onclose = function () {
        close();
        layer.alert('停止');
    };

    ws.onerror = function (ev) {
        close();
        layer.alert('未知错误<br>' + JSON.stringify(ev));
    };

    ws.onmessage = function (ev) {
        var rd = new FileReader();
        rd.readAsArrayBuffer(ev.data);
        rd.onload = function () {
            var bs = fromBuffer(rd.result);
            for (var i = 0; i < bs.length;) {
                var len = uint(bs.slice(i, i + 4));
                var data = decode(bs.slice(i, i + 4 + len));
                handle(data);
                i += len + 4;
            }
        };
    };
}

function close() {
    clearInterval(alive);
    if (ws) {
        ws.send(encode({ 'type': 'logout' }));
        ws.close();
    }
    R = null;
    _start.disabled = false;
    _start.classList.remove('layui-btn-disabled');
    _close.disabled = true;
    _close.classList.add('layui-btn-disabled');
}

function keep() {
    ws.send(encode({ 'type': 'mrkl' }));
    alive = setInterval(function () {
        ws.send(encode({ 'type': 'mrkl' }));
    }, 30000);
}

function noble(nl) {
    var i = parseInt(nl);
    if (i >= 1 || i <= 9) {
        return nobleList[i];
    }
    return '';
}

function initGift() {
    $.ajax({
        url: giftURL + '/api/gift/v2/web/list?rid=' + R,
        cache: false,
        timeout: 5000,
        success: function (resp) {
            if (resp.data && resp.data.giftList) {
                resp.data.giftList.forEach(function (v) {
                    giftList['a' + v.id] = { name: v.name, price: v.priceInfo.price };
                });
            }
            [
                'a20624', // 魔法球
                'a20626' // 幸福券
            ].forEach(function (v) {
                if (giftList[v]) {
                    giftList[v].price = 0;
                }
            });
        }
    });
}

function gift(id, pid, callback) {
    var a = giftList['a' + id];
    if (a) {
        return callback(a);
    }
    var b = giftList['b' + pid];
    if (b) {
        return callback(b);
    }
    if (!id) {
        id = '0';
    }
    if (!pid) {
        pid = '0';
    }
    var g = { name: id + '_' + pid, price: 0 };
    if (pid === '0') {
        return callback(g);
    }
    $.ajax({
        url: giftURL + '/api/prop/v1/web/single?pid=' + pid,
        timeout: 5000,
        complete: function (resp) {
            if (resp.status === 200) {
                var data = resp.responseJSON;
                if (data && data.data) {
                    g.name = data.data.name;
                    g.price = parseInt(data.data.price);
                    giftList['b' + pid] = g;
                }
            }
            return callback(g);
        }
    });
}

function handle(msg) {
    setTimeout(function () {
        var t = time();
        var nl = noble(msg.nl);
        switch (msg.type) {
            case 'chatmsg':
                if (ML > -1 && parseInt(msg.level) >= ML) {
                    addMsg(_msg1, t, msg.nn, msg.level, nl, msg.bnn, msg.bl, '[弹幕] ' + msg.txt);
                }
                break;
            case 'dgb':
                if (GL > -1 && msg.bg) {
                    gift(msg.gfid, msg.pid, function (g) {
                        if (g.price * parseInt(msg.hits) >= GL * 100) {
                            var txt = '[礼物] ' + g.name + ' ' + msg.gfcnt + ' 个，共 ' + msg.hits + ' 个';
                            addMsg(_msg2, t, msg.nn, msg.level, nl, msg.bnn, msg.bl, txt);
                        }
                    });
                }
                break;
            case 'uenter':
                if (UL > -1 && parseInt(msg.level) >= UL) {
                    addMsg(_msg3, t, msg.nn, msg.level, nl, null, null, '[进入房间]');
                }
                break;
            case 'anbc':
                if (parseInt(msg.drid) === R) {
                    addMsg(_msg2, t, msg.unk, msg.level, nl, null, null, '[开通爵位] ' + nl);
                }
                break;
            case 'rnewbc':
                if (parseInt(msg.drid) === R) {
                    addMsg(_msg2, t, msg.unk, msg.level, nl, null, null, '[续费爵位] ' + nl);
                }
                break;
            default:
                break;
        }
    }, 0);
}

function time() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    if (h < 10) {
        h = '0' + h;
    }
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }
    return h + ':' + m + ':' + s;
}

function buildMsg(t, nn, level, nl, bnn, bl, txt) {
    var _l = '', _b = '';
    if (level) {
        _l = '(' + level + ')';
    }
    if (bnn) {
        var _bl = parseInt(bl);
        if (_bl > 0 && _bl < 10) {
            _bl = '0' + _bl;
        }
        _b = '<span class="bl">(' + _bl + ')</span>' + '<span class="bnn">' + bnn + '</span>';
    }
    var p = document.createElement('p');
    p.innerHTML =
        '<span class="nl">' + nl + '</span>' +
        '<span class="level">' + _l + '</span>' +
        '<span class="nn">' + nn + '</span>' +
        _b + '<br>' +
        '<span class="time">' + t + '</span>' +
        '<span class="txt">' + txt.replace('\n', '') + '</span>' +
        '<hr>';
    return p;
}

function addMsg(e, t, nn, level, nl, bnn, bl, txt) {
    e.insertBefore(buildMsg(t, nn, level, nl, bnn, bl, txt), e.firstChild);
    _msg.insertBefore(buildMsg(t, nn, level, nl, bnn, bl, txt), _msg.firstChild);
    delMsg(e);
    delMsg(_msg);
}

function delMsg(e) {
    if (e.children.length <= maxMessage) {
        return;
    }
    while (true) {
        e.removeChild(e.lastChild);
        if (e.children.length <= maxMessage) {
            break;
        }
    }
}
