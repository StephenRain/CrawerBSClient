var jquery = jQuery.noConflict();

//定义常量
const CAIJI_STATUS_KEY = "caijiStatus";      // 对应采集状态
const PRE_PROCESS_KEY = "preExpress";
const PADIAN_LIST_KEY = "padianList";          // 对应爬点表达式集合
const POST_EXPRESS_KEY = "postExpress";        // 对应后处理集合
const DOWNLOAD_RESULT_KEY = "downloadResult";  //对应下载结果
const COMM_CLICK = 'click';
const COMM_HEAD = 'head';
const COMM_END = "end";
const COMMM_FUNC = "function";
const COMM_CLEAR = "clear";  //清空采集结果
const COMM_CLOSE = "close";
const COMMANDS = [COMM_CLICK, COMM_HEAD, COMM_END, COMMM_FUNC, COMM_CLEAR, COMM_CLOSE];  // 所有的命令
const DEFAULT_FILE_NAME = "默认采集文件.csv";
const DEFAULT_DELAY = 1000;
const CAIJI_DEFAULT_VAL = "空";
const SYSTEM_ERROR_MSG = "脚本执行异常,如有需要，请联系作者反馈问题，作者微信：gg112233445566mm";
const INNER_OBJ_KEY = "inner_obj";
const JIAN_TOU = "=>";
const DETAIL_RES_KEY = "detail_res";     // 详情页采集结果key
const DETAIL_FRAME_NAME = "detail_frame_name";
const DETAIL_PAGE_CONTAINER_KEY = "detailPage";
//const WS_URL="wss://www.xiaoyupaopaopao.com:7443/ws/endpoint/";
//const WS_URL = "ws://127.0.0.1:7070/ws/endpoint/";

//变量
var DOWNLOAD_RESULT_CONTAINER = new DownloadResult();   // 采集结果容器
var DETAIL_PAGE_UNIT_RESULTS = [];    // 结果信息
var DETAIL_PAGE_CONTAINER = [];    // 用来存放详情页页面信息
var DELAY_TIME = DEFAULT_DELAY;                         // 多个页面采集的间隔时间(ms)
var isStop = false;
// 对外暴露的内置对象
const config = {
    wsUrl:null
}

// 定义面板字符串
var panelStr = `
	    <div id='panel'>
	        <div class="caiji-title">
	           网页自动脚本
                <div id="caiji-control" class="float-right">
                    <button class="ant-btn" id="refresh-btn" title="点击该按钮然后拖动面板区域即可">刷新页面</button>
                    <button class="ant-btn" id="drag-btn" title="点击该按钮然后拖动面板区域即可">拖动/不可拖动</button>
                    <button class="ant-btn" id="clear-style-btn" title="如果面板样式显示的很怪异，不和之前一样，点击这个按钮删除原有网页的样式即可恢复">重置面板样式</button>
                    <!--<button class="ant-btn" id="show-detail-btn" title="采集详情页时显示出详情页">显示/隐藏详情页</button>-->
                    <button class="ant-btn ant-btn-red " id="caiji-close">关闭面板</button>
                </div>
            </div>
            <iframe id="frame_container" style="display: none" width="100%" height="200px" src="" name="${DETAIL_FRAME_NAME}"></iframe>
            <form id="caiji-form ">
                <div class="form-group">
                    <div>
                        <textarea id="pre-express" class="caiji-input" placeholder="前处理表达式(选填):在采集数据前需要执行的脚本，输入的内容会被执行"/>
                    </div>
                    <span id="inputs">
                        <input class="caiji-input"  autocomplete="off"  name="padian-express" style="margin:6px 0"
                        title="样例:IP@#list > table > tbody > tr:nth-child({{1-10:2}}) > td:nth-child(1)"  type="text" 
                        placeholder="爬点表达式输入框，输入格式: 自定义名称@元素选择器@属性,其中属性可不填,默认采集网页中的文本，如果填写属性,则采集属性值"/>
                    </span>
                    <input type="button" class="ant-btn" id="add_padian" value="添加爬点"/>
                    <div id="postProcess">
                        <textarea name="post-express"  autocomplete="off" class="postCurrPage caiji-input" style="margin:6px 0"
                        placeholder="后处理动作输入框(选填)，在采集当前页后执行,输入格式:动作@网页元素选择器,例如:click@#aa,表示点击该页面id为aa的元素"/>
                    </div>
                    <input type="button" class="ant-btn" id="add-curr-post" value="添加后处理"/>
                    <div class="">
                        <input type="button" class="ant-btn" id="save" value="保存"/>
                        <input type="button" class="ant-btn ant-btn-primary" id="auto_caiji" value="自动采集">
                        <div class="float-right">
                            <input type="button" title="清空采集结果" class="ant-btn" id="clear-caiji-result-btn" value="清空采集结果"/>
                            <input type="button" title="停止采集" class="ant-btn ant-btn-red" id="stop-caiji-btn" value="结束列表采集"/>
                            <input type="button" title="下载采集结果" class="ant-btn ant-btn-primary" id="download-caiji" value="下载采集结果"/>
                        </div>
                    </div>
                    <div id="caiji-pannel-bottom">
                        <span>
                        系统消息:<span id="caiji-msg"></span>
                        </span>
                        <span class="float-right">共采集<span id="caiji-count" style="color: red"> </span>条数据</span>
                    </div>
                </div>
            </form>
	    <div/>
	`;


// 初始化面板及面板中数据
function initPanel() {
    console.log("正在初始化面板")
    var jquery = jQuery.noConflict();
    // 创建面板
    jquery(panelStr).prependTo(jquery("body:first"));
    // 添加爬点按钮
    jquery("#add_padian").click(function () {
        jquery("#inputs > input:nth-child(1)").clone().val("").appendTo(jquery("#inputs"));
    })
    // 添加后处理按钮
    jquery("#add-curr-post").click(function () {
        jquery("#postProcess > textarea:nth-child(1)").clone().val("").appendTo(jquery("#postProcess"));
    })
    // 保存按钮
    jquery("#save").click(function () {
        try {
            let preExpress = getPreExpress();
            set(PRE_PROCESS_KEY, preExpress);
            let padianList = getPadianList();
            set(PADIAN_LIST_KEY, JSON.stringify(padianList));
            let postList = getPostList();
            set(POST_EXPRESS_KEY, JSON.stringify(postList));
            closePannel();
            initPanel();
            msg("已保存");
        } catch (e) {
            msg(e.message)
        }
    })
    // 停止采集按钮
    jquery("#stop-caiji-btn").click(function () {
        setCaijiDone("按钮");
    })
    // 下载采集结果
    jquery("#download-caiji").click(function () {
        prepareDownload(getDownloadResult());
    })
    // 自动采集按钮
    jquery("#auto_caiji").click(function () {
        var delayTime = prompt("请输入页面采集间隔时间(ms),默认为" + DEFAULT_DELAY + "毫秒", DEFAULT_DELAY + "");
        DELAY_TIME = parseInt(delayTime);
        if (isNaN(DELAY_TIME)) {
            alert("输入应该为数字，已将时间设置为默认间隔时间：" + DEFAULT_DELAY);
            DELAY_TIME = DEFAULT_DELAY;
        }
        if (!confirm("采集间隔时间会随机在" + DELAY_TIME + "和" + 2 * DELAY_TIME + "范围之间取值 ，点击确认开始采集")) {
            msg("已取消采集");
            return;
        }
        clickAutoCaiji();
    })
    // 拖动按钮
    jquery("#drag-btn").click(function () {
        dragTaggle();
    })
    // 关闭
    jquery("#caiji-close").click(function () {
        closePannel();
    })

    //
    function closePannel() {
        jquery("#panel").remove();
    }

    jquery("#refresh-btn").click(function () {
        window.history.go(0);
    })

    // 显示隐藏 详情页
    jquery("#show-detail-btn").click(function () {
        jquery("#frame_container").toggle();
    })

    // 更新可拖动状态
    function dragTaggle() {
        let dom = document.getElementById("panel");
        if (dom.onmousedown != null) {
            dom.onmousedown = null;
            jquery("#drag-btn").css("color", "black");
        } else {
            // 设置可拖动
            let width = window.screen.availWidth;
            let height = window.screen.availHeight;
            jquery("#drag-btn").css("color", "green");
            utils.drag(document.getElementById("panel"), -1000, width + 1000, -1000, height + 1000);
        }
    }

    // 清空之前网页的样式
    jquery("#clear-style-btn").click(function () {
        jquery("head > style").each(function () {
            if (!jquery(this).text().includes("#panel{")) {
                jquery(this).remove();
            }
        })
        jquery("head > link").remove();
        msg("已删除网页样式，恢复面板样式");
    })
    jquery("#clear-caiji-result-btn").click(function () {
        remove(DOWNLOAD_RESULT_KEY);
        DOWNLOAD_RESULT_CONTAINER = new DownloadResult();
        remove(DETAIL_PAGE_CONTAINER_KEY);
        DETAIL_PAGE_CONTAINER = [];
        msg("已清空采集结果");
    })
    //const frameContainerDom = window.top.document.getElementById("frame_container")


    // 组装面板中数据
    ;(function () {
        //加载前处理
        jquery("#pre-express").val(get(PRE_PROCESS_KEY));
        // 从本地加载爬点
        var padianListStr = get(PADIAN_LIST_KEY);
        if (!isEmpty(padianListStr)) {
            var padianList = JSON.parse(padianListStr);
            if (padianList.length > 0) {
                for (var i = 1; i < padianList.length; i++) {
                    jquery("#inputs > input:nth-child(1)").clone().val("").appendTo(jquery("#inputs"));
                }
                for (var j = 0; j < padianList.length; j++) {
                    var padian = padianList[j];
                    if (isEmpty(padian.inputStr)) {
                        let val = padian.name + "@" + padian.selector;
                        if (!isEmpty(padian.attr)) {
                            val += "@" + padian.attr;
                        }
                        if (!isEmpty(padian.action)) {
                            val += JIAN_TOU + padian.action + "@" + JSON.stringify(padian.detailJson);
                        }
                        jquery("#inputs input")[j].value = val;
                    } else {
                        jquery("#inputs input")[j].value = padian.inputStr;
                    }
                }
            }
        }
        // 从本地加载后处理
        let postExpress = get(POST_EXPRESS_KEY);
        if (!isEmpty(postExpress)) {
            jquery(JSON.parse(postExpress)).each(function (i, item) {
                if (i !== 0) {
                    jquery("#postProcess > textarea:nth-child(1)").clone().val("").appendTo(jquery("#postProcess"));
                }
            })
            jquery("#postProcess > .postCurrPage").each(function (i, item) {
                jquery(this).val(JSON.parse(postExpress)[i]);
            })
        }
    })()

}


// 从页面中获取数据,同时校验
var getPadianList = function () {
    var list = [];
    let input_values = jquery("#inputs>input");
    input_values.each(function () {
        let val = jquery(this).val();
        if (!isEmpty(val)) {
            if (val.includes(JIAN_TOU)) {
                let arr = val.split(JIAN_TOU);
                let nameSelector = arr[0];
                let actionStr = arr[1];
                let actionArr = actionStr.split('@');
                let padianArr = nameSelector.split("@");
                let name = padianArr[0];
                let selector = padianArr[1];
                let attr = null;
                let action = actionArr[0];
                let detailJson = JSON.parse(actionArr[1]);
                if (padianArr.length === 3) {
                    attr = padianArr[2];
                }
                if (actionArr.length < 2 || padianArr.length === 0) {
                    throw new Error(val + ",不符合爬点格式");
                }
                let padian = new Padian(val, name, selector, attr, action, detailJson);
                list.push(padian);
            } else {
                if (val.includes("@")) {
                    let array = val.split("@");
                    let name = array[0];
                    let selector = array[1];
                    let attr = null;
                    if (array.length === 3) {
                        attr = array[2];
                    }
                    if (isEmpty(name) || isEmpty(selector)) {
                        throw new Error(val + ",不符合爬点格式");
                    }
                    let padian = new Padian(val, name, selector, attr);
                    list.push(padian);
                } else {
                    throw new Error(val + ",不符合爬点格式");
                }
            }
        }
    })
    return list;
}
var getPostList = function () {
    let postProcessArr = [];
    jquery("#postProcess > .postCurrPage").each(function () {
        if (!isEmpty(jquery(this).val())) {
            let val = jquery(this).val();
            if (val.indexOf("@") === -1) {
                throw new Error(val + ",不符合后处理格式");
            } else {
                let has = false;
                for (let i = 0; i < COMMANDS.length; i++) {
                    if (val.indexOf(COMMANDS[i]) !== -1) {
                        has = true;
                    }
                }
                if (!has) {
                    throw new Error(val + "不符合后处理表达式");
                }
            }
            postProcessArr.push(jquery(this).val());
        }
    })
    return postProcessArr;
}
var getPreExpress = function () {
    return jquery("#pre-express").val().trim();
}

function DetailPage(url, json) {
    this.url = url
    this.json = json
}



//定义爬点对象
function Padian(inputStr, name, jsPath, attr, action, detailJson) {
    this.inputStr = inputStr;
    this.name = name;
    this.jsPath = jsPath;
    this.attr = attr;
    this.action = action;
    this.detailJson = detailJson;
}

//定义采集状态
function CaijiStatus(code, currUrl, preUrl, detailCode) {
    this.code = code;       //1：正在运行   2:采集结束
    this.currUrl = currUrl;
    this.preUrl = preUrl;
    this.detailCode = detailCode;    // 详情页采集状态 null:未开始 1:正在运行 2 采集结束
}

function DownloadResult() {
    this.name = "";
    this.titles = [];
    this.list = [];
    this.addUnit = function (unitResult) {
        this.list.push(unitResult);
    }
    this.addTitle = function (title) {
        this.titles.push(title);
    }
}

function isEmpty(object) {
    return object == null || object === "undefined" || object === "null"
        || false || object === "" || object === '""' || object === "''"
        || object.length === 0;
}

// 下载
function download(downloadResult) {
    //要导出的json数据
    const jsonData = downloadResult.list;
    let titleStr = "";
    jquery(downloadResult.titles).each(function (i, item) {
        titleStr += item;
        if (i < downloadResult.titles.length - 1) {
            titleStr += ",";
        }
    })
    if (isEmpty(jsonData)) {
        msg("无数据下载");
        return;
    }
    //列标题，逗号隔开，每一个逗号就是隔开一个单元格
    let str = titleStr + "\n";
    //增加\t为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < jsonData.length; i++) {
        for (let item in jsonData[i]) {
            str += `${jsonData[i][item] + '\t'},`;
        }
        str += '\n';
    }
    //encodeURIComponent解决中文乱码
    let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    //通过创建a标签实现
    let link = document.createElement("a");
    link.href = uri;
    //对下载的文件命名
    link.download = isEmpty(downloadResult.name) ? DEFAULT_FILE_NAME : downloadResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

// 准备下载
function prepareDownload(downloadResult) {
    if (isEmpty(downloadResult) || isEmpty(downloadResult["list"])) {
        return;
    }
    // todo 清理垃圾数据
    downloadResult.name = prompt("请输入要保存的文件名称,支持csv、txt格式", DEFAULT_FILE_NAME);
    download(downloadResult);
    setCaijiDone("【下载完成】");
}

// 判断列表是否否完成
function isCaijiDone() {
    let caijiStatusJson = getCaijiStatus();
    if (!isEmpty(caijiStatusJson)) {
        return caijiStatusJson["code"] === 2;
    }
    return false;
}

function removeDownloadResult() {
    remove(DOWNLOAD_RESULT_KEY);
    DOWNLOAD_RESULT_CONTAINER = new DownloadResult();
}

function msg(msg) {
    jquery("#caiji-msg").text(msg);
}

// 关闭当前页
function closeCurrPage() {
    // 关闭当前页面，**注意必须是window.open()打开的页面才有效果**
    window.opener = null;
    window.open('', '_self');
    window.close();
}

// 存储到本地浏览器
function set(key, value) {
    window.localStorage.setItem(key, value);
    console.log("存入本地:" + "key=" + key + ",value=" + value);
}

// 读取
function get(key) {
    return window.localStorage.getItem(key);
}

//删除
function remove(key) {
    window.localStorage.removeItem(key);
    console.log("删除:" + key);
}

// 模拟点击动作
function clickDom(selector) {
    let selectorList = [];
    if (selector.includes("{{")) {
        selectorList = parseMore(selector, selector);
    } else {
        selectorList.push(selector);
    }
    for (let i = 0; i < selectorList.length; i++) {
        let dom = document.querySelector(selectorList[i])
        if (!isEmpty(dom)) {
            dom.click();
        } else {
            console.log("页面无该元素:" + selectorList[i] + ",无法点击");
            return false;
        }
    }

    return true;
}

// 详情页单个爬点对象
function DetailPadianRes(padian, list) {
    this.padian = padian;     // 对应列表页的爬点
    this.list = list;
}

function getpadian2PathMap(padianList) {
    let padianPathListMap = {};   // key 是 爬点对象JSON串,value是该爬点对应的所有inputStr
    // 这个循环就是获取jsPathNameListMap
    for (let i = 0; i < padianList.length; i++) {
        let padian = padianList[i];
        let inputStr = padian.inputStr;
        let jsPath = padian.jsPath;
        if (inputStr.includes("{{")) {
            let jsPathList = parseMore(inputStr, jsPath);
            padianPathListMap[JSON.stringify(padian)] = jsPathList;
        } else {
            padianPathListMap[JSON.stringify(padian)] = [inputStr];
        }
    }
    console.log("标题映射选择器" + JSON.stringify(padianPathListMap));
    return padianPathListMap;
}

/**
 * 对输入框内数据进行1对多转换
 * @param inputStr
 * @param jsPath
 */
function parseMore(inputStr, jsPath) {
    function getNumberObj(numberStr) {
        let numberObj = {};
        let arr = numberStr.split("-");
        let start = parseInt(arr[0]);
        let step = 1;
        let end = start + step;
        let endStr = arr[1];
        if (endStr.includes(":")) {
            end = parseInt(endStr.split(":")[0]);
            step = parseInt(endStr.split(":")[1]);
        } else {
            end = parseInt(endStr);
        }
        numberObj["start"] = start;
        numberObj["step"] = step;
        numberObj["end"] = end;
        return numberObj;
    }

    let padianTemplate = Handlebars.compile(inputStr);
    // 解析jsPath 变为多条jsPath
    let number1 = jsPath.indexOf("{{");
    let number2 = jsPath.lastIndexOf("{{")

    var str1 = jsPath.substring(number1 + 2, jsPath.indexOf("}}"));
    let numberObj1 = getNumberObj(str1);

    let numberObj2 = null;
    let str2 = null;
    if (number1 !== number2) {
        str2 = jsPath.substring(number2 + 2, jsPath.lastIndexOf("}}"));
        numberObj2 = getNumberObj(str2);
    }

    let jsPathList = [];
    let content = {};
    for (let n = numberObj1.start; n <= numberObj1.end; n = n + numberObj1.step) {
        content[str1] = n;
        if (numberObj2 != null && str2 != null) {
            for (let n2 = numberObj2.start; n2 <= numberObj2.end; n2 = n2 + numberObj2.step) {
                content[str2] = n2;
                let realJsPath = padianTemplate(content);
                jsPathList.push(realJsPath);
            }
        } else {
            let realJsPath = padianTemplate(content);
            jsPathList.push(realJsPath);
        }
    }
    return jsPathList;
}

function detailUnitResult(unitReuslt) {
    let isGet = false;
    let detailRes = get(DETAIL_RES_KEY);
    console.log("detailRes" + detailRes);
    if (!isEmpty(JSON.parse(get(DETAIL_RES_KEY)).list)) {
        isGet = true;
        let list = JSON.parse(get(DETAIL_RES_KEY)).list;
        console.log("详情页数据:" + JSON.stringify(list));
        list.forEach(value => {
            for (let key in value) {
                unitReuslt[key] = value[key];
            }
        })
        remove(DETAIL_RES_KEY);
        console.log("unitReslt" + JSON.stringify(unitReuslt));
    } else {
        console.log("详情页数据为加载到");
    }
    return isGet;
}

/**
 *
 * @param padianPathListMap
 * @param i                 每个path列表第i个元素
 * @returns {{}}
 */
function getUnitResult(padianPathListMap, i) {
    let unitResult = {};
    for (let padianJsonStr in padianPathListMap) {
        var pathlist = padianPathListMap[padianJsonStr];
        let padian = JSON.parse(padianJsonStr);
        var path = pathlist[i];
        if (!path.includes(".") && !path.includes("#") && !path.includes(">")) {
            unitResult[padian.name] = padian.jsPath;
            continue;
        }

        let jiantouPre;     // 箭头前的值
        if (path.includes(JIAN_TOU)) {
            jiantouPre = path.split(JIAN_TOU)[0];
        } else {
            jiantouPre = path;
        }
        let realSelector = jiantouPre.split("@")[1];
        let jqDom = jquery(realSelector)
        if (isEmpty(jqDom[0])) {
            saveDownloadResult();
            alert("页面中无对应元素,已结束采集\r\n" + jiantouPre)
            return null;
        }
        // 组装爬点单元结果
        unitResult[padian.name] = getPadianRes(padian, jqDom);
    }
    return unitResult;
}

/**
 *  采集开始
 */
var autoCaiji = function (newPadianObj) {
    initDetailPage();
    DOWNLOAD_RESULT_CONTAINER = getDownloadResult();
    var padianList = getPadianList();
    if (newPadianObj != null) {
        for (let key in newPadianObj) {
            for (let index = 0; index < padianList.length; index++) {
                if (padianList[index]["name"] === (key)) {
                    padianList[index]["jsPath"] = newPadianObj[key];
                }
            }
        }
    }

    setCaijiRunning();
    msg("正在采集" + window.location.href);
    if (!executePreProcess()) {
        setCaijiDone("前处理脚本");
        return;
    }
    let padianPathListMap = getpadian2PathMap(padianList);
    // 校验爬取点对应的jsPath数量是否相同
    let countArr = [];
    for (let key in padianPathListMap) {
        countArr.push(padianPathListMap[key].length);
    }
    let stand = countArr[0]; //每个名称对应的爬点Path数量
    for (let i = 0; i < countArr.length; i++) {
        if (countArr[i] !== stand) {
            alert("各爬点表达式对应选择器数量不一致，请重新输入正确格式的爬点表达式");
            return false;
        }
    }
    // 对每个jsPath解析出结果
    for (let i = 0; i < stand; i++) {
        let unitResult = getUnitResult(padianPathListMap, i);
        if (unitResult === null) {
            break;
        }
        if (!isRubbishData(unitResult)) {
            DOWNLOAD_RESULT_CONTAINER.addUnit(unitResult);
            msg("采集到数据:" + JSON.stringify(unitResult));
        }
    }
    // 当前页后处理
    postProcess();
}

// 采集详情页面
function caijiDetailPage(index) {
    var frameContainerDom = window.top.document.getElementById("frame_container");
    // 采集详情页数据
    let detailPageJson = DETAIL_PAGE_CONTAINER[index];
    if (isEmpty(detailPageJson)) {
        return;
    }
    let url = detailPageJson["url"];
    let detailJson = detailPageJson["json"];
    jquery("#frame_container").attr("src", url);
    frameContainerDom.onload = function () {
        msg("详情页加载完毕:" + url);
        for (let name in detailJson) {
            let unitResult = {};
            let selector = detailJson[name];
            let documentJq = jquery(frameContainerDom.contentWindow.document);
            let val;
            if (selector.includes("!")) {
                val = documentJq.find(selector.split("!")[0]).attr[selector.split("!")[1]];
            } else {
                val = utils.removeBlank(documentJq.find(selector).text());
            }
            msg("采集详情页:" + url + ",结果:" + name + "=>" + val);
            unitResult[name] = val;
            DETAIL_PAGE_UNIT_RESULTS.push(unitResult);
            console.log(DETAIL_PAGE_UNIT_RESULTS);
        }
        if (index < DETAIL_PAGE_CONTAINER.length - 1) {
            caijiDetailPage(++index);
        } else {
            let listPageUnitResults = DOWNLOAD_RESULT_CONTAINER.list;
            if (listPageUnitResults.length !== DETAIL_PAGE_UNIT_RESULTS.length) {
                alert("列表页采集数:" + listPageUnitResults.length + ",详情页数量:" + DETAIL_PAGE_UNIT_RESULTS.length + ",请重新采集!");
            }
            for (let i = 0; i < listPageUnitResults.length; i++) {
                let listUnitResult = listPageUnitResults[i];
                let detailUnitResult = DETAIL_PAGE_UNIT_RESULTS[i];
                for (let name in detailUnitResult) {
                    listUnitResult[name] = detailUnitResult[name];
                }
            }
            Object.keys(detailJson).forEach((title) => {
                DOWNLOAD_RESULT_CONTAINER.addTitle(title);
            })
            console.log("详情页采集数据和列表数据合并完成" + JSON.stringify(DOWNLOAD_RESULT_CONTAINER));
            setDetailCaijiDone();
        }
    }
}

function setDetailCaijiDone() {
    saveDownloadResult();
    DETAIL_PAGE_CONTAINER = [];  // 结束置空
    remove(DETAIL_PAGE_CONTAINER_KEY);
    DETAIL_PAGE_UNIT_RESULTS = [];
    msg("详情页全部采集完成");
}

function getCaijiStatus() {
    if (!isEmpty(get(CAIJI_STATUS_KEY))) {
        return JSON.parse(get(CAIJI_STATUS_KEY));
    }
    return null;
}


//通过点击按钮 执行采集
var clickAutoCaiji = function () {
    jquery(function () {
        setTimeout(function () {
            try {
                stop = false;
                autoCaiji();
            } catch (e) {
                set(CAIJI_STATUS_KEY, JSON.stringify(new CaijiStatus(0, window.location.href)));
                msg(SYSTEM_ERROR_MSG + ",异常信息" + e.message);
                throw e;
            }
        }, DELAY_TIME)
    })
}
// 从本地获取内置对象
var getInnerObj = function () {
    let innerObjJson = JSON.stringify(get(INNER_OBJ_KEY));
    if (!isEmpty(innerObjJson)) {
        return innerObjJson;
    }
    return config;
}
// 保存内置对象
var saveInnerObj = function () {
    set(INNER_OBJ_KEY, JSON.stringify(config));
}

// 根据爬点对象采集到页面的数据
function getPadianRes(padian, jqDom) {
    let padianRes = CAIJI_DEFAULT_VAL;   // 采集的数据
    if (!isEmpty(padian.attr)) {
        padianRes = jqDom.attr(padian.attr);
    } else {
        if (!isEmpty(jqDom.text())) {
            padianRes = utils.removeBlank(jqDom.text());
        } else {
            padianRes = utils.removeBlank(jqDom.val())
        }
    }
    return padianRes;
}

// 后处理
function postProcess() {

    if (!isEmpty(getPadianList())) {
        if (isEmpty(DOWNLOAD_RESULT_CONTAINER) || isEmpty(DOWNLOAD_RESULT_CONTAINER["list"])) {
            setCaijiDone("【未采集到的数据】");
        }
        if (isDiffPage()) {
            set(DOWNLOAD_RESULT_KEY, JSON.stringify(DOWNLOAD_RESULT_CONTAINER));
        }
        let list = DOWNLOAD_RESULT_CONTAINER["list"];
        // 检测采集数据是否重复
        if (list.length > 2) {
            let last = list[list.length - 1];
            let second = list[list.length - 2];
            if (JSON.stringify(last) === JSON.stringify(second)) {
                msg("检测到最近采集的数据有重复:" + JSON.stringify(last));
            }
        }
        jquery("#caiji-count").text(list.length);
    }
    // 采集数量
    let postList = getPostList();
    if (!isEmpty(postList)) {
        executePost(postList[0], postList, 0);
    } else {
        setCaijiDone("后处理为空");
    }
}

// 执行前处理表达式
function executePreProcess() {
    // 执行前处理脚本
    let preExpress = getPreExpress();
    if (!isEmpty(preExpress)) {
        let jsText = preExpress;
        if (preExpress.includes("{{")) {
            let template = Handlebars.compile(preExpress);
            jsText = template(config);
        }
        return new Function("obj", "jquery", jsText)(config, jquery);
    }
    return true;
}

// 执行后处理指令
function executePost(postExpress, postList, index) {
    if (isCaijiDone()) {
        return;
    }
    console.log("正在执行后处理表达式:" + postExpress);
    let arr = postExpress.split("@");
    let action = arr[0];
    let detail = arr[1];
    if (action.startsWith("!") && index < postList.length - 1) {
        index++;
        console.log("跳过后处理指令:" + action)
        executePost(postList[index], postList, index);
    } else {
        // 执行指令动作
        setTimeout(function () {
            try {
                let doing = true;
                if (action === COMM_CLICK) {
                    if (!clickDom(detail)) {
                        setCaijiDone("页面无该元素:" + detail + ",已结束采集");
                        doing = false;
                    }
                } else if (action === COMM_HEAD) {
                    autoCaiji();
                } else if (action === COMM_END) {
                    if (isEmpty(detail) || eval(detail)) {
                        setCaijiDone("执行后处理:" + detail + "");
                        doing = false;
                    }
                } else if (action === COMMM_FUNC) {
                    //new Function("config", "jquery","result", detail)(config, jquery,DOWNLOAD_RESULT_CONTAINER);
                    utils.evalFunc(detail);
                } else if (action === COMM_CLOSE) {
                    closeCurrPage();
                } else if (action === COMM_CLEAR) {
                    removeDownloadResult();
                }

                if (doing && index + 1 < postList.length) {
                    index++;
                    executePost(postList[index], postList, index);
                }
            } catch (e) {
                msg("执行后处理时出错,请检查后处理表达式格式是否正确。错误信息:" + e.message);
                throw e;
            }
        }, DELAY_TIME)
    }
}

// 对采集单元结果进行校验
function isRubbishData(unitResult) {
    // 校验采集结果
    if (Object.values(unitResult).includes(CAIJI_DEFAULT_VAL)) {
        let rubbish = true;
        Object.values(unitResult).forEach((value) => {
            if (value !== CAIJI_DEFAULT_VAL) {
                rubbish = false;
            }
        })
        return rubbish;
    }
    return false;
}

// 判断当前需不需要继续采集
function isContinue() {
    let caijiStatusStr = get(CAIJI_STATUS_KEY);
    return !isEmpty(caijiStatusStr) && JSON.parse(caijiStatusStr).code === 1;
}

// 设置运行时采集状态
function setCaijiRunning() {
    let preUrl = null;
    if (!isEmpty(JSON.parse(get(CAIJI_STATUS_KEY)))) {
        preUrl = JSON.parse(get(CAIJI_STATUS_KEY))['currUrl'];
    }
    set(CAIJI_STATUS_KEY, JSON.stringify(new CaijiStatus(1, window.location.href, preUrl)));
}

// 设置采集状态为采集完成
function setCaijiDone(who) {
    isStop = true;
    set(CAIJI_STATUS_KEY, JSON.stringify(new CaijiStatus(2)));
    saveDownloadResult();
    msg("已结束列表采集:" + who);
    caijiDetailPage(0);
}

// 保存采集结果到本地浏览器
function saveDownloadResult() {
    if (!isEmpty(DOWNLOAD_RESULT_CONTAINER.list)) {
        set(DOWNLOAD_RESULT_KEY, JSON.stringify(DOWNLOAD_RESULT_CONTAINER));
    }
}


// 判断是否进入下一个不同页面,第一次打开算是不同，采集中跳转不同页面也算是true
function isDiffPage() {
    let caijiStatusStr = get(CAIJI_STATUS_KEY);
    if (isEmpty(caijiStatusStr)) {
        return true;
    }
    let caijiStatusJson = JSON.parse(caijiStatusStr);
    if (!isEmpty(caijiStatusJson.currUrl) && !isEmpty(caijiStatusJson.preUrl)) {
        return caijiStatusJson.currUrl !== caijiStatusJson.preUrl;
    } else if (isEmpty(caijiStatusJson.preUrl)) {
        return true;
    }
    return false;
}

function initDetailPage() {
    if (!isEmpty(get(DETAIL_PAGE_CONTAINER_KEY))) {
        DETAIL_PAGE_CONTAINER = JSON.parse(get(DETAIL_PAGE_CONTAINER_KEY));
    }
}

// 初始化downloadResult,不同页面从本地获取
function getDownloadResult() {
    if (isDiffPage()) {
        if (!isEmpty(JSON.parse(get(DOWNLOAD_RESULT_KEY)))) {
            let json = JSON.parse(get(DOWNLOAD_RESULT_KEY));
            DOWNLOAD_RESULT_CONTAINER['name'] = json["name"];
            DOWNLOAD_RESULT_CONTAINER["titles"] = json["titles"];
            DOWNLOAD_RESULT_CONTAINER["list"] = json["list"];
        }
    }
    if (isEmpty(DOWNLOAD_RESULT_CONTAINER["titles"])) {
        let padianList = getPadianList();
        padianList.forEach((value => {
            DOWNLOAD_RESULT_CONTAINER.addTitle(value.name);
        }))
    }
    return DOWNLOAD_RESULT_CONTAINER;
}

