# CrawerBSClient

介绍：
谷歌浏览器插件-网页采集大师,可以快速/方便的采集网页中的数据，不论是网页数据还是接口数据，都可以采集。


前处理表达式： 
  用来编写JS脚本，可以理解为JS的函数，只需要编写具体的函数体，可以在采集前做些处理，返回false，处理终止，返回true，处理继续。
  可以不填写，填写了便会执行。
  

爬点表达式：
  用来编写爬取的数据的一定格式，格式是：自定义名称@爬取数据的选择器@属性，其中属性可选，填写了属性便采集属性。
  当采集多个选择器类似的数据时，比如采集商品列表数据，某两个商品价格的选择如下：
  #mainsrp-itemlist > div > div > div:nth-child(1) > div:nth-child(4) > div.ctx-box.J_MouseEneterLeave.J_IconMoreNew > div.row.row-1.g-clearfix > div.price.g_price.g_price-highlight > strong
  #mainsrp-itemlist > div > div > div:nth-child(1) > div:nth-child(3) > div.ctx-box.J_MouseEneterLeave.J_IconMoreNew > div.row.row-1.g-clearfix > div.price.g_price.g_price-highlight > strong
  这时去找其他商品的价格选择器，找到某个nth-child括号中在变化的数据，基本列表数据选择器格式基本一致，在上述的两个选择器表达式中，只有div:nth-child(4)和div:nth-child(3)是不一致的，
  只需要在该处的括号改为{{3-4}}，括号里表示从3到4都分别采集，你也可以写成{{3-4:1}}，冒号后面表示每次递增1。
  那么这里爬点表达式就可以写成：  价格@ #mainsrp-itemlist > div > div > div:nth-child(1) > div:nth-child({{3-4}}) > div.ctx-box.J_MouseEneterLeave.J_IconMoreNew > div.row.row-1.g-clearfix > div.price.g_price.g_price-highlight > strong
  需要注意的是，当采集比方说商品标题时也得用这种格式，并且数量要是一致的，就是价格你采集一个，标题也必须是一个，不然没法对应起来。
  
后处理表达式：
  在采集到指定数据后需要做的处理，格式:指令@内容，内容可选，比如： click@元素选择器，意思是点击某个页面中指定的元素。
还有 head@，这个从头开始再执行一遍，即从前处理开始接着执行。
clear@  表示清空采集结果。
function@alert('111') 表示：执行js函数。
end@JS脚本  表示当JS脚本执行结果为true时，结束采集。
后处理可以执行多个，按照先后顺序依次执行，间隔时间取决于自动采集时设定的时间。

编写完上述东西后，即可点击开始采集，会提示你输入页面采集间隔时间，这个默认1秒，是指在采集多个页面的间隔时间，并且每个后处理指令执行前的等待时间。
采集完毕，点击下载即可。会生成一个Excel文件。

通过上述方式，是可以很方便在浏览器端采集分页列表数据。
对于通过接口获取的数据，也可以在前处理脚本中执行，编写脚本的方式编写Ajax,将返回的数据送到自己编写的服务器端。

关于跨域及网页安全策略等：一般来说不需要考虑，即使浏览器有限制，也有办法解决。









