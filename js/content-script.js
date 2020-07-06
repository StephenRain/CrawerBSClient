;(function () {
    // 主函数
    (function () {
        window.jquery = jQuery.noConflict();
        //const WS="ws://127.0.0.1:7070/ws/endpoint/";
        const WS = null;
        if(WS !=null){
            let socket = utils.openSocket(WS + encodeURIComponent(window.location));
        }
        try {
            initPanel();
            // 如果正在采集中，则继续自动采集
            if (isContinue()) {
                if (!executePreProcess()) {
                    msg("前处理脚本返回false,停止采集");
                    setCaijiDone("前处理脚本");
                    return;
                }
                autoCaiji();
            }
            msg("缓存中共有" + getDownloadResult().list.length + "条采集结果数据");
        } catch (e) {
            msg(SYSTEM_ERROR_MSG);
            throw e;
        }
    })()
})();