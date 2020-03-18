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

(function () {
    _start.onclick = function () {
        if (!R) {
            if (!_room.value) {
                layer.alert('房间号为空');
                return;
            }
            R = parseInt(_room.value);
            ML = parseInt(_danmu.value);
            GL = parseInt(_gift.value);
            UL = parseInt(_user.value);
            localStorage.setItem('r', _room.value);
            _msg.innerHTML = '';
            _start.disabled = true;
            _start.classList.add('layui-btn-disabled');
            _close.disabled = false;
            _close.classList.remove('layui-btn-disabled');
            start();
        }
    };

    _close.onclick = function () {
        if (R) {
            R = null;
            _start.disabled = false;
            _start.classList.remove('layui-btn-disabled');
            _close.disabled = true;
            _close.classList.add('layui-btn-disabled');
            close();
        }
    };

    _room.value = localStorage.getItem('r');
    _start.disabled = false;
    _start.classList.remove('layui-btn-disabled');
})();
