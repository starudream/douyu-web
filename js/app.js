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
            maxMessage = parseInt(_size.value);
            localStorage.setItem('r', _room.value);
            _start.disabled = true;
            _start.classList.add('layui-btn-disabled');
            _close.disabled = false;
            _close.classList.remove('layui-btn-disabled');
            start();
        }
    };

    _close.onclick = function () {
        if (R) {
            close();
        }
    };

    var r = localStorage.getItem('r');
    if (r) {
        _room.value = localStorage.getItem('r');
    }

    _start.disabled = false;
    _start.classList.remove('layui-btn-disabled');
})();
