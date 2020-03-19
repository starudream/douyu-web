var nobleList = {
    1: '骑士',
    2: '子爵',
    3: '伯爵',
    4: '公爵',
    5: '国王',
    6: '皇帝',
    7: '游侠',
    8: '超帝',
    9: '幻神'
};

// 原地址为：https://gift.douyucdn.cn，解决跨域问题使用 nginx 反代
var giftURL = 'https://giftdouyucdn.starudream.cn';

var giftList = {};

var maxMessage = 200;

var c2s = 689; // Client to Server
var s2c = 690; // Server to Client

function encode(kv) {
    var buff = [];
    for (var k in kv) {
        if (!kv.hasOwnProperty(k)) continue;
        buff.push(encodeValue(k) + '@=' + encodeValue(kv[k]) + '/');
    }
    return toBuffer(encodeRaw(buff.join('')));
}

function encodeRaw(data) {
    return [].concat(
        putUint(9 + data.length, 4),
        putUint(9 + data.length, 4),
        putUint(c2s, 2),
        putUint(0, 1),
        putUint(0, 1),
        putString(data),
        putUint(0, 1)
    );
}

function encodeValue(v) {
    v = v.toString();
    v = v.replace('@', '@A');
    v = v.replace('/', '@S');
    return unescape(encodeURIComponent(v));
}

function decode(data) {
    var bs = decodeRaw(data);
    if (bs.length === 0) {
        return {};
    }
    var fields = string(bs).split('/');
    var res = {};
    for (var i in fields) {
        if (!fields.hasOwnProperty(i)) continue;
        var kv = fields[i].split('@=');
        if (kv.length !== 2) continue;
        res[decodeValue(kv[0])] = decodeValue(kv[1]);
    }
    return res;
}

function decodeRaw(data) {
    if (data.length < 13) {
        return [];
    }
    var l1 = uint(data.slice(0, 4));
    var l2 = uint(data.slice(4, 8));
    if (l1 !== l2 || uint(data.slice(8, 10)) !== s2c || uint(data.slice(10, 11)) !== 0 || uint(data.slice(11, 12)) !== 0) {
        return [];
    }
    return data.slice(12, l1 + 3);
}

function decodeValue(v) {
    v = v.toString();
    v = v.replace('@A', '@');
    v = v.replace('@S', '/');
    return decodeURIComponent(escape(v));
}

function toBuffer(bs) {
    var ab = new ArrayBuffer(bs.length);
    var dv = new DataView(ab);
    for (var i = 0; i < bs.length; i++) {
        dv.setUint8(i, bs[i]);
    }
    return ab;
}

function fromBuffer(ab) {
    var bs = [];
    var dv = new DataView(ab);
    for (var i = 0; i < ab.byteLength; i++) {
        bs[i] = dv.getUint8(i);
    }
    return bs;
}

function putUint(v, l) {
    var res = [];
    for (var i = 0; i < l; i++) {
        res[i] = (v >> i * 8) % 256;
    }
    return res;
}

function uint(v) {
    var res = 0;
    for (var i = 0; i < v.length; i++) {
        res |= v[i] << i * 8;
    }
    return res;
}

function putString(v) {
    var res = [];
    for (var i = 0; i < v.length; i++) {
        res[i] = v.charCodeAt(i);
    }
    return res;
}

function string(v) {
    var res = '';
    for (var i = 0; i < v.length; i++) {
        res += String.fromCharCode(v[i]);
    }
    return res;
}

function start() {
    console.log('房间号：' + R + '，弹幕等级：' + ML + '，礼物价值：' + GL + '，进入房间：' + UL);

    ws = new WebSocket('wss://danmuproxy.douyu.com:8502/');

    ws.onopen = function () {
        ws.send(encode({ 'type': 'loginreq', 'roomid': R }));
        ws.send(encode({ 'type': 'joingroup', 'rid': R, 'gid': '-9999' }));
        keep();
        initGift();
    };

    ws.onclose = function () {
    };

    ws.onerror = function (ev) {
        close();
        layer.alert('未知错误，请重新开始\n' + JSON.stringify(ev));
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
    ws.send(encode({ 'type': 'logout' }));
    R = null;
    _start.disabled = false;
    _start.classList.remove('layui-btn-disabled');
    _close.disabled = true;
    _close.classList.add('layui-btn-disabled');
    ws.close();
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

function gift(id, pid) {
    var a = giftList['a' + id];
    if (a) {
        return a;
    }
    var b = giftList['b' + pid];
    if (b) {
        return b;
    }
    if (!id) {
        id = '0';
    }
    if (!pid) {
        pid = '0';
    }
    var g = { name: id + '_' + pid, price: 0 };
    if (pid === '0') {
        return g;
    }
    $.ajax({
        url: giftURL + '/api/prop/v1/web/single?pid=' + pid,
        async: false,
        timeout: 5000,
        success: function (resp) {
            if (resp && resp.data) {
                g.name = resp.data.name;
                g.price = parseInt(resp.data.price);
                giftList['b' + pid] = g;
            }
        }
    });
    return g;
}

function handle(msg) {
    setTimeout(function () {
        var nl = noble(msg.nl);
        switch (msg.type) {
            case 'chatmsg':
                if (ML > -1 && parseInt(msg.level) >= ML) {
                    addMsg(_msg1, msg.nn, msg.level, nl, msg.bnn, msg.bl, '[弹幕] ' + msg.txt);
                }
                break;
            case 'dgb':
                if (GL > -1 && msg.bg) {
                    var g = gift(msg.gfid, msg.pid);
                    if (g.price * parseInt(msg.hits) >= GL * 100) {
                        var txt = '[礼物] ' + g.name + ' ' + msg.gfcnt + ' 个，共 ' + msg.hits + ' 个';
                        addMsg(_msg2, msg.nn, msg.level, nl, msg.bnn, msg.bl, txt);
                    }
                }
                break;
            case 'uenter':
                if (UL > -1 && parseInt(msg.level) >= UL) {
                    addMsg(_msg3, msg.nn, msg.level, nl, null, null, '[进入房间]');
                }
                break;
            case 'anbc':
                if (parseInt(msg.drid) === R) {
                    addMsg(_msg2, msg.unk, msg.level, nl, null, null, '[开通爵位] ' + nl);
                }
                break;
            case 'rnewbc':
                if (parseInt(msg.drid) === R) {
                    addMsg(_msg2, msg.unk, msg.level, nl, null, null, '[续费爵位] ' + nl);
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

function buildMsg(nn, level, nl, bnn, bl, txt) {
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
        '<span class="time">' + time() + '</span>' +
        '<span class="txt">' + txt.replace('\n', '') + '</span>' +
        '<hr>';
    return p;
}

function addMsg(e, nn, level, nl, bnn, bl, txt) {
    e.insertBefore(buildMsg(nn, level, nl, bnn, bl, txt), e.firstChild);
    _msg.insertBefore(buildMsg(nn, level, nl, bnn, bl, txt), _msg.firstChild);
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
