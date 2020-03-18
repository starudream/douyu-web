var R, // 房间号
    ML, // 是否开启弹幕，屏蔽等级
    GL, // 是否开启礼物，屏蔽价格
    UL; // 是否开启进入房间，屏蔽等级

var ws, alive;

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
