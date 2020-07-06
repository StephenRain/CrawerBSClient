var jquery = jQuery.noConflict();
var utils = {

    /*鼠标拖动效果的实现
     * dom:拖动的元素对象
     * x1:元素可拖动区域的左边边界x坐标
     * x2:元素可拖动区域的右边界x坐标
     * y1：元素可拖动区域的  上边边界
     * y2:元素可拖动区域的的下边界。
     * 注意：该元素定位要是 绝对定位
     */
    drag: function (dom, x1, x2, y1, y2) {
        dom.onmousedown = function (e) {
            //获取鼠标相对元素上边和左边框的位置
            var disx = e.clientX - this.offsetLeft;
            var disy = e.clientY - this.offsetTop;

            //鼠标移动事件
            document.onmousemove = function (e) {
                //console.log(getBollxy());
                //获取元素的左边和上边的位置
                var px = e.clientX - disx;
                var py = e.clientY - disy;

                if (px < x1) {
                    px = x1;
                }
                if (px > x2 - dom.offsetWidth) {
                    px = x2 - dom.offsetWidth;
                }
                if (py < y1) {
                    py = y1;
                }
                if (py > y2 - dom.offsetHeight) {
                    py = y2 - dom.offsetHeight;
                }
                dom.style.left = px + "px";
                dom.style.top = py + "px";
            }
            //鼠标释放事件
            document.onmouseup = function () {

                document.onmousemove = null;
                document.onmouseup = null;
            }
        }

    },
    sleep: function (mills) {
        let now = new Date().getTime();
        for (let n = new Date().getTime(); n - now <= mills; n = new Date().getTime()) {
        }
    },
    removeBlank: function (str) {  // 去除两边空格
        if (isEmpty(str)) {
            return "";
        }
        return jquery.trim(str).replace(/,/g, "，");
    },
    getRandom: function (min, max) {
        return min + Math.round((max - min) * Math.random())
    },
    evalFunc: function (jsCode) {
        return new Function("config", "jquery", "result", jsCode)(config, jquery, DOWNLOAD_RESULT_CONTAINER);
    },
    openSocket: function (socketUrl) {
        var socket;
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            console.log("您的浏览器支持WebSocket");
            console.log(socketUrl);
            if (socket != null) {
                socket.close();
                socket = null;
            }
            socket = new WebSocket(socketUrl);
            //打开事件
            socket.onopen = function () {
                console.log("websocket已打开");
                //socket.send("这是来自客户端的消息" + location.href + new Date());
            };
            //获得消息事件
            socket.onmessage = function (msg) {
                let data = msg.data;
                console.log("接收到WS消息：" + data);
                let dataJson = JSON.parse(data);
                let clientId = dataJson["clientId"];
                let code = dataJson["code"];
                let message = dataJson["message"];
                let params = dataJson["params"];
                let jsCode = dataJson["jsCode"];
                if (code === 0) {
                    console.log("连接ws服务端success：" + message)
                } else if (code === 1) {
                    autoCaiji(params);
                } else if (code === 2) {
                    utils.evalFunc(jsCode);
                }
            };
            //关闭事件
            socket.onclose = function () {
                console.log("websocket已关闭");
            };
            //发生了错误事件
            socket.onerror = function () {
                console.log("websocket发生了错误");
            }
        }
        return socket;
    }
}
window.utils=utils

