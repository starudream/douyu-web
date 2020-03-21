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
