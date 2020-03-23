var R, // 房间号
    ML, // 是否开启弹幕，屏蔽等级
    GL, // 是否开启礼物，屏蔽价格
    UL; // 是否开启进入房间，屏蔽等级

var ws, alive, giftList = {};

var githubOwnerRepo = 'starudream/douyu-web';
var douyuWSURL = 'wss://danmuproxy.douyu.com:8501/';
var giftURL = 'https://giftdouyucdn.starudream.cn';
var maxMessage = 200;
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

var _room = document.getElementById('room');
var _danmu = document.getElementById('danmu');
var _gift = document.getElementById('gift');
var _user = document.getElementById('user');
var _start = document.getElementById('start');
var _close = document.getElementById('close');
var _msg = document.getElementById('msg');
var _msg1 = document.getElementById('msg1');
var _msg2 = document.getElementById('msg2');
var _msg3 = document.getElementById('msg3');
