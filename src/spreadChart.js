
// 传播图
function isArray(array) {
    if (Array.isArray(array)) return true;
    return false;
}

function buildRandId() {
    var str = "abcdefghijkomnopqrstuvwsyz";
    var t = 0,
        s = '',
        arr = [],
        len = 5;
    for (var j = 0; j < len; j++) {
        for (var i = 0; i < len; i++) {
            t = Math.floor(Math.random() * 26);
            s += str[t];
        }
        s += j;
        arr.push(s);
        s = '';
    }
    return arr;
}

export function getUrlParam(name) {
    var reg = new RegExp("[?&]" + name + "=([^&]*)");
    var r = location.href.match(reg);
    if (r != null) return unescape(r[1]);
    return '';
}

class SpreadRouteChart {

    charge = -50

    linkDistance = 70

    theta = 0.999

    gravity = 0.01

    alpha = 0.999

    constructor(classname, {
        // 传播总数据
        data,

        // 类型光晕图还是普通图，默认光晕
        type,

        // 渠道颜色
        nodeColor,

        // 节点颜色
        levelColor,

        // 线条
        lineColor,

        // 节点名字颜色
        nameColor,

        // 隐藏的节点
        buried,

        // 点击节点的回调
        nodeClick,

        // 添加节点样式
        nodeClass

        }, forceConfig) {

        let fn = this,
            win = window.location;

        Object.assign(this, forceConfig);

        // this.urllink = win.pathname + win.search || '';
        this.urllink = win.href;
        this.classname = classname;
        this.channelNodesColor = nodeColor;
        this.needHideNodes = buried;
        this.nodeGradientIds = buildRandId();

        this.topchil = [];
        this.relation = [];
        this.pureData = data.treedata || data.main || data;
        this.nodes = [];
        this.links = [];
        this.nodeClick = nodeClick;
        this.nodeClass = nodeClass || [];

        this._setSize();
        this._clear();
        this._createSvg();

        this._showType(type);
        this._setLineColor(lineColor);
        this._setNodeColor(levelColor);
        this._setNameColor(nameColor);


        this.force = d3.layout.force()
            .nodes([{}]) // 坑，这会是this.nodes的第一个元素，所以下面要覆盖
            .charge(this.charge)
            .linkDistance(this.linkDistance)
            .theta(fn.theta)
            .size([fn.width, fn.width])
            .gravity(fn.gravity)
            .alpha(fn.alpha)
            .on("tick", ticked);

        this.link = this.svg.append("g").selectAll(".link");
        this.node = this.svg.append("g").selectAll(".node");
        this.text = this.svg.append("g").selectAll("text");
        this.nodes = this.force.nodes();
        this.links = this.force.links();



        function ticked() {
            fn.link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
            fn.node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        }

    }

    _showType(type) {
        if (type === "auto") {
            this.type = data.length > 500 ? 'other' : 'common';
        } else {
            this.type = type;
        }
    }
    _setSize(classname) {
        var element = document.querySelector(this.classname);
        this.width = element.offsetWidth || document.documentElement.clientWidth;
        this.height = element.offsetHeight || document.documentElement.clientHeight;
    }
    _clear() {
        d3.select(this.classname).html('');
    }
    _createSvg() {
        var fn = this;
        this.svg = d3.select(this.classname).append("svg").call(fn._zoom()).attr("width", fn.width).attr("height", fn.height).append("g");
        this.defs = this.svg.append("defs");
    }

    /**
     * [setCommonColor 普通节点的颜色]
     * @param {[type]} commonColor [description]
     */
    _setNodeColor(nodeColor) {
        // 活动源，一层，二层，三层，四层

        const { type } = this;
        let fn = this,
            color = {},
            defaultColor = [];
        if (!type || type == "common") {
            color = {
                root: "#af823a",
                one: "#c5c754",
                two: "#4cb896",
                three: "#a2ea8d",
                four: "#e0fea6",
            }
        } else {
            color = {
                root: [
                    { "color": "#2dcfa0", "offset": "0", "opacity": 1 },
                    { "color": "#079292", "offset": "60", "opacity": 1 },
                    { "color": "#373f72", "offset": "100", "opacity": 1 }
                ],
                one: [
                    { "color": "#9eacfe", "offset": "0", "opacity": 1 },
                    { "color": "#6270c6", "offset": "60", "opacity": 1 },
                    { "color": "#015d5d", "offset": "100", "opacity": 1 }
                ],
                two: [
                    { "color": "#95edf7", "offset": "0", "opacity": 1 },
                    { "color": "#28cde0", "offset": "60", "opacity": 1 },
                    { "color": "#047c9a", "offset": "100", "opacity": 1 }
                ],
                three: [
                    { "color": "#2dcfa0", "offset": "0", "opacity": 1 },
                    { "color": "#079292", "offset": "60", "opacity": 1 },
                    { "color": "#373f72", "offset": "100", "opacity": 1 }
                ],
                four: [
                    { "color": "#95edf7", "offset": "0", "opacity": 1 },
                    { "color": "#28cde0", "offset": "60", "opacity": 1 },
                    { "color": "#047c9a", "offset": "100", "opacity": 1 }
                ]
            };
        }
        Object.assign(color, nodeColor);
        defaultColor = [color.root, color.one, color.two, color.three, color.four];
        this.nodeColor = [];
        for (let i = 0, len = defaultColor.length; i < len; i++) {
            let color = defaultColor[i];
            if (isArray(color)) {
                this._createGradientColor(i, color);
                this.nodeColor[i] = "url(" + fn.urllink + "#" + this.nodeGradientIds[i] + ")";
            } else {
                this.nodeColor[i] = color;
            }
        }

    }

    _createGradientColor(index, gradientColor) {
        var radialGradient = this.defs.append("radialGradient").attr("id", this.nodeGradientIds[index]).attr("cx", "50%").attr("cy", "50%").attr("r", "50%").attr("fx", "50%").attr("fy", "50%");
        gradientColor.forEach(function (gradient, i) {
            radialGradient.append("stop").attr("offset", gradient.offset + "%").style("stop-color", gradient.color).style("stop-opacity", gradient.opacity);
        }.bind(this));
    }
    _setLineColor(lineColor) {

        let color = {
            friend: "#95edf7",
            moments: "#7c92de",
            groups: "#316e46",
            other: "#047c9a"
        };
        Object.assign(color, lineColor);

        // 朋友，朋友圈，微信群,其他
        this.lineColor = ['', color.friend, color.moments, color.groups, color.other];


    }
    _setNameColor(nodeName = "#fff") {
        this.nodeNameColor = nodeName;
    }

    /**
      * [handleData 处理数据]
      * @param  {[type]} jsonobj [description]
      * @return {[type]}         [nodes links]
      */
    _createForceNodes(jsonobj) {
        //去掉不用的数据
        this._removeBuries();
        return this._create();
    }

    _removeBuries() {
        const { pureData, relation, needHideNodes } = this;
        if (!isArray(needHideNodes)) return false;
        for (let i = 0, len = pureData.length; i < len; i++) {
            let node = pureData[i];
            relation[node.O] = i;
            this._setNodeAttrHide(node, i);
        }
        this.pureData = pureData.filter(node => {
            return !node.hide;
        });
    }

    _setNodeAttrHide(node, i) {
        const { needHideNodes, relation, pureData } = this;
        if (needHideNodes.indexOf(node.N) !== -1 || (relation[node.F] && pureData[relation[node.F]].hide)) {
            node.hide = 1;
        }
    }

    _create() {
        const { pureData, width, height, topchil, channelNodesColor } = this;
        this.relation = []; // 重新建立关联关系
        let root = pureData[0],
            middle = {},
            nodesColor = this._getConfigColorChannel(channelNodesColor),
            links = [],
            nodes = [];
        this.childNumMax = root.C;
        this.childNumMin = root.C;
        for (let i = 0, len = pureData.length; i < len; i++) {
            let middle = {},
                node = pureData[i];
            middle.childNum = node.C;
            middle.showName = middle.childNum > 100 ? true : false;
            middle.name = node.N;
            middle.oid = node.O;
            middle.fid = node.F;
            middle.level = node.L > 4 ? 4 : node.L;
            middle.time = node.T;
            middle.readfrom = node.R > 4 ? 4 : node.R;
            middle.x = width * Math.random();
            middle.y = height * Math.random();
            middle.class = this.nodeClass[middle.oid];
            if (i == 0) {
                middle.fixed = true;
                middle.fid = "top";
                middle.x = width / 2;
                middle.y = height / 2;
                middle.showName = true;
                middle.level = 0;
            }
            this._setMiddleColor(middle, nodesColor);
            nodes[i] = middle;
            if (i > 0) {
                links[i - 1] = {
                    source: this.relation[node.F],
                    target: i
                };
            }
            this.relation[node.O] = i;
            this.qmin = this.qmin > +node.C ? +node.C : this.qmin;
            this.qmax = this.qmax < +node.C ? +node.C : this.qmax;
            topchil.push(middle.childNum);
        }

        this.nodes[0] = nodes[0];
        this._topChildNum(5, nodes);
        return [nodes, links];
    }


    /**
     * [addnewdata 新增数据处理]
     * @return {[type]} [description]
     */
    addnewdata(data) {
        var fn = this,
            nodeIndex = fn.relation;
        nodei = 0;
        len = this.nodes.length;
        if (!data) return false;
        for (var j = 0; j < data.length; j++) {
            if (nodeIndex[data[j].O]) continue;
            if (nodeIndex[data[j].F] == null || typeof (nodeIndex[data[j].F]) == "undefined") continue;
            var value = 0;
            if (data[j].L == 1) value = 6;
            else if (data[j].L == 2) value = 5;
            else if (data[j].L == 3) value = 4;
            else if (data[j].L >= 4) value = 3;

            var node = {
                "level": data[j].L > 4 ? 4 : data[j].L,
                "name": data[j].N,
                "value": value,
                "x": fn.width * Math.random(),
                "y": fn.height * Math.random(),
                "oid": data[j].O,
                "foid": data[j].F,
                "chilNum": data[j].C,
                "readfrom": data[j].R,
                time: data[j].T
            };

            this.nodes.push(node);
            nodeIndex[data[j].O] = len;
            //  fn.graph.links.push({source: nodeIndex[data[j].O], target: nodeIndex[data[j].F]});
            this.links.push({ source: nodeIndex[data[j].F], target: nodeIndex[data[j].O] });
            len++;
        }
    }


    _getConfigColorChannel(channelNodesColor) {
        let children,
            channel,
            result = {};
        for (let channelName in channelNodesColor) {
            if (channelNodesColor.hasOwnProperty(channelName)) {
                let nodeColor = channelNodesColor[channelName];
                if (isArray(nodeColor)) {
                    if (nodeColor.length >= 2) {
                        children = nodeColor[1];
                        channel = nodeColor[0];
                    } else {
                        children = channel = nodeColor[0];
                    }
                    result[channelName] = { children, channel };
                } else {
                    children = channel = nodeColor;
                    result[channelName] = { channel, status: 1 };
                }
                //  result[channelName] = { children, channel };
            }
        }
        return result;
    }

    _setMiddleColor(middle, nodesColor) {
        let fid = this.relation[middle.fid],
            fnode = this.nodes[fid],
            channelNodesColor = this.channelNodesColor,
            name = middle.name;

        if (this._checkIsChannel(name)) {
            if (nodesColor[name].status) {
                middle.scolor = nodesColor[name].channel;
            } else {
                middle.color = nodesColor[name].channel;
            }

        }
        if (fnode && fnode.color) {
            let nodeColor = nodesColor[fnode.name];
            if (nodeColor && nodeColor.children) {
                middle.color = nodeColor.children;
            } else {
                middle.color = fnode.color;
            }

        }
    }

    /**
    * [haloNodeColor 检查是否是渠道]
    * @param  {[type]} name [节点名]
    * @return {[type]}     [description]
    */
    _checkIsChannel(nodeName) {
        var channelNodesColor = this.channelNodesColor;
        for (var i in channelNodesColor) {
            if (channelNodesColor.hasOwnProperty(i) && i == nodeName) {
                return true;
            }
        }
        return false;
    }


    _topChildNum(rankNum, nodes) {
        const { topchil } = this;
        topchil.sort(function (a, b) { return b - a; });
        let count = rankNum;
        for (let i = 0, len = nodes.length; i < len; i++) {
            if (this._isTop(nodes[i].childNum, rankNum)) {
                count--;
                nodes[i].showName = true;
                if (count <= 0) break;
            }
        }
    }

    _isTop(a, b) {
        a = parseInt(a);
        if (b < this.topchil.length) {
            if (a >= this.topchil[b]) return true;
            else return false;
        } else {
            return true;
        }
    }
    /**
     * [draw 绘制入口]
     * @param  {[json]} data [数据]
     */
    draw() {
        const fn = this;
        const { nodes, links, theta, gravity, alpha } = this;
        let [tempNodes, tempLinks] = this._createForceNodes();
        this.restart();

        // 垃圾代码，后期优化
       
        let totalStep = getUrlParam('step');
        let step = totalStep;
        if (!step || !parseInt(step)) {
            step = 3;
        } else {
            step--;
        }
        let nodesKey = 1,
            nodeKey = 1,
            linksKey = 0,
            linkKey = 0,
            showData = [],
            nodesLength = tempNodes.length,
            
            showFlag = 0;
        

        let firstStep = 13,
            firstNum = 500;
        
        // 10 30 60 90 
        showData.push(10);
        for (var i = 1; i <= 3; i++) {
            if (i * 30 > nodesLength) break;
            showData.push(i * 30);
        }
        // 200 300 400 500
        for (var i = 2; i <= 5; i++) {
            if (i * 100 > nodesLength) break;
            showData.push(i * 100);
        }

        // 1000 2000 3000 4000
        for (var i = 1; i <= 4; i++) {
            if (i * 1000 > nodesLength) break;
            showData.push(i * 1000);
        } 

        //  5000
        showData.push(nodesLength);

        // // 将剩余的节点平均分
        // let surplusNodes = nodesLength - firstNum,
        //     stepNum = parseInt(surplusNodes / (step-firstStep));

        
        // for (var i = 1; i < stepNum; i++) {
        //     showData.push(i*stepNum+firstNum);
        // }

        // 添加最后的节点
      //  showData.push(nodesLength);

        function num(s) {
            if (showFlag < 7) return 1100;
            if (showFlag == 7) return 1500;
            if (showFlag == 8) return 2500;
            if (showFlag >= 9) return 4000;
        }
        
        var that = this;

        // 这的timer是外面定义的，为了重新播放的功能
        timer = setInterval(function() {
            console.log(showFlag);
            if (showFlag > (showData.length - 1)) {
                clearInterval(timer);
                return false;
            }
            let len = showData[showFlag++];
            for (let i = nodesKey; i < len; i++) {
                nodes[nodesKey++] = tempNodes[nodeKey++];
            }
            for (let j = linksKey; j < len - 1; j++) {
                links[linksKey++] = tempLinks[linkKey++];
            }
            fn.restart();
        }, num(showFlag))

        // var timer = setInterval(function () {
          
        // },(totalStep-step)*1000);

    }

    animate() {
        
    }

    restart() {
        this.force.start().alpha(this.alpha);
        this.drawLinks();
        this.drawNodes();
        this.eventslistener(this.nodeClick);
    }

    drawLinks() {
        var fn = this;
        const { links, lineColor } = this;
        this.link = this.link.data(fn.links);
        this.link.enter()
            .append("line")
            .attr("class", "link")
            .transition()
            .delay(500)
            .duration(2000)
            .ease("elastic")
            .attr("stroke", function (d, i) {
                return lineColor[d.target.readfrom];
            })
            .style("stroke-width", 1);
    }
    /**
     * [drawNodes 绘制节点]
     * @param  {[type]} graph [description]
     * @return {[type]}       [description]
     */
    drawNodes() {
        var fn = this;

        const { nodeColor, nodeNameColor } = this;



        fn.node = fn.node.data(fn.nodes);
        fn.text = fn.text.data(fn.nodes);


        // d3.select(".node-g").html('');

        fn.node.enter()
            .append("g")
            .attr("class", "node-g")
            .call(this.force.drag);

        fn.node.append("circle")
            .attr("class", (d, i) => {
                return d.class;
            })
            .style("fill", function (d) {
                if (d.scolor) return d.scolor;
                else return d.color ? d.color : nodeColor[d.level];
            })
            // 动画要放到fill的下面，不然没效果
            .attr("r", 0)
            .transition()
            .duration(2000)
            .ease("elastic")
            .attr("r", function (d) { return d.childNum > 3 ? fn.chilscale(d.childNum) : fn.chilscale(3); })
            .style("cursor", "pointer");

        fn.node.append("text")
            .attr("dy", ".3em")
            .attr("class", "nodetext")
            .style("text-anchor", "middle")
            .style("fill", nodeNameColor)
            .transition()
            .delay(500)
            .duration(2000)
            .ease("elastic")
            .text(function (d, i) {
                return d.name;
            })
            .attr("display", function (d) {
                return d.showName ? "block" : "none";
            });

        //    this.drawCommonNode();
    }

    /**
    * [drawCommonNode 普通节点]
    * @param  {[type]} node [description]
    * @return {[type]}      [description]
    */
    drawCommonNode() {
        var fn = this;
        const { nodeColor, nodeNameColor } = this;
        this.node.append("circle")
            .attr("r", function (d) { return d.childNum > 3 ? fn.chilscale(d.childNum) : fn.chilscale(3); })
            .style("cursor", "pointer")
            .style("fill", function (d) {
                if (d.scolor) return d.scolor;
                else return d.color ? d.color : nodeColor[d.level];
            });

        this.node.append("text")
            .attr("dy", ".3em")
            .attr("class", "nodetext")
            .style("text-anchor", "middle")
            .style("fill", nodeNameColor)
            .text(function (d, i) {
                return d.name;
            })
            .style("display", function (d) {
                return d.showName ? "block" : "none";
            })

    }

    /**
     * [eventslistener 事件模块]
     * @param  {[type]} node [description]
     * @return {[type]}      [description]
     */
    eventslistener(callback) {
        var fn = this;
        this.node.on('click', function (d, i) {

            this.lastChild.style.display = "block";

            d.showtext = true;
            fn._showMask(i);
            d3.event.preventDefault();
            d3.event.stopPropagation();
            if (callback && d.name != "活动源") {
                setTimeout(function () {
                    callback(d);
                }, 1000)

                setTimeout(function () {
                    fn._resetChart(fn.nodes[0].x, fn.nodes[0].y);
                }, 1500);
            }
        });
    }


    /**
     * 显示遮罩页
     */
    _showMask(cid) {

        this.force.stop();
        const x = this.width / 2,
            y = this.height * 0.48 / 2, // 中心点的
            tx = this.nodes[cid].x,
            ty = this.nodes[cid].y,
            px = tx - x,
            py = ty - y;

        this.svg.transition()
            .duration(1000)
            .attr("transform", "translate(" + -px + ", " + -py + ")scale(" + 1 + ")");

        this.link.attr("stroke-opacity", 1).transition().attr("stroke-opacity", 0.1);
        this.node.attr("opacity", (d, i) => {
            if (d.oid != this.nodes[cid].oid) return 0.1;
            else return 1;
        })
        this.zoom.translate([-px, -py]).scale(1); // 初始化默認缩放量
    }



    _resetChart(tx, ty, sx, sy) {
        const x = sx || this.width / 2,
            y = sy || this.height / 2, // 中心点的
            px = tx - x,
            py = ty - y;
        this.svg.transition().duration(1000).attr("transform", "translate(" + -px + ", " + -py + ")scale(" + 1 + ")");
        this.link.attr("stroke-opacity", 0.1).transition().attr("stroke-opacity", 1);
        this.node.attr("opacity", 1);
        this.zoom.translate([-px, -py]).scale(1); // 初始化默認缩放量
    }

    chargescale(q) {   
        var min = 100, max = 1000;
        return -1 * ((max - min) / (this.qmax - this.qmin) * q + (this.qmax * min - this.qmin * max) / (this.qmax - this.qmin));
    }

    chilscale2(c) {
        var min = 3, max = 100;
        return ((max - min) / (this.qmax - this.qmin) * c + (this.qmax * min - this.qmin * max) / (this.qmax - this.qmin));
    }
    chilscale(c) {
        if (c <= 0) return 1;
        return Math.pow((4 * (Math.log(c) / Math.log(2))), 0.95);
    }

    /**
     * [drag 拖拽]
     * @return {[type]} [description]
     */
    drag() {
        var fn = this;
        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
            fn.force.start();
        }
        function dragged(d) {
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy",
                d.y = d3.event.y);
        }
        function dragended(d) {
            d3.select(this).classed("dragging", false);
        }
        return d3.behavior.drag().origin(function (d) {
            return d;
        }).on("dragstart", dragstarted).on("drag", dragged).on("dragend",
            dragended);
    }
    /**
     * [zoom 缩放]
     * @return {[type]} [description]
     */
    _zoom() {
        var fn = this;
        function zoomed() {
            fn.svg.attr("transform", "translate(" + d3.event.translate + ")scale("
                + d3.event.scale + ")");
        }
        this.zoom = d3.behavior.zoom().scaleExtent([0.001, 10]).on("zoom", zoomed);
        return this.zoom;
    }

    /**
     * [searchTreeNames 根据姓名模糊搜索出node的信息]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    searchTreeNames(name) {
        var pattern = new RegExp(name, "i"); // 这个匹配牛逼
        var data = [];
        for (var i = 0; i < this.graph.nodes.length; i++) {
            var t = this.graph.nodes[i];
            if (pattern.test(t.name)) {
                var d = {};
                d.openid = t.oid;
                d.foid = t.foid;
                d.name = t.name;
                d.id = i;
                data.push(d);
            }
        }
        return data;
    }
    /**
     * [showTreeRoute 根据id搜索当前节点的传播路径]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    showTreeRoute(id) {
        if (!id) {
            this._reloadforce(true);
            return;
        }
        var rd = this.graph.nodes[id];

        for (var i = 0; i < this.graph.nodes.length; i++) {
            this.graph.nodes[i].showline = false;
            this.graph.nodes[i].shownode = false;
        }
        while (rd) {
            rd.showline = true;
            rd.shownode = true;
            rd = this.graph.nodes[this.relation_data[rd.foid]];
        }
        this._reloadforce();
    }
    showTreeChild(id) {
        if (!id) {
            this._reloadforce(true);
            return;
        }
        var rd = this.graph.nodes[id];

        for (var i = 0; i < this.graph.nodes.length; i++) {
            this.graph.nodes[i].showline = false;
            this.graph.nodes[i].shownode = false;
        }
        rd.showline = false;
        rd.shownode = true;
        var memory = [];
        this.dfs(this.graph.nodes, id, rd.oid, memory);
        for (var i = 0; i < memory.length; i++) {
            memory[i].showline = true;
            memory[i].shownode = true;
        }
        this._reloadforce();
    }
    dfs(data, cur, oid, ids) {
        for (var i = cur + 1; i < data.length; i++) {
            var t = data[i];
            if (t.foid == oid) {
                ids.push(t);
                this.dfs(data, i, t.oid, ids);
            }
        }
        return;
    }

    _reloadforce(flag, time, opacity) {
        if (!flag) flag = false;
        if (!time) time = 1000;
        if (!opacity && opacity !== 0) opacity = 0.1;
        this.link.attr("stroke-opacity", function (d) { return d.opacity; }).transition().duration(time).attr("stroke-opacity", function (d) {
            if (flag) {
                d.opacity = "1";
                return "1";
            }
            if (d.target.showline) {
                d.opacity = "1";
                return "1";
            } else {
                d.opacity = opacity;
                return opacity;
            }
        });
        this.node.attr("opacity", function (d) { return d.opacity; }).transition().duration(time).attr("opacity", function (d) {
            if (flag) {
                d.opacity = "1";
                return "1";
            }
            if (d.shownode) {
                d.opacity = "1";
                return "1";
            } else {
                d.opacity = opacity;
                return opacity;
            }

        });
    }

    /**
     * [play 传播图播放]
     * @return {[type]} [description]
     */
    play() {
        var fn = this;
        this.cancelMouseEvent();
        for (var i = 0; i < this.graph.nodes.length; i++) {
            this.graph.nodes[i].showline = false;
            this.graph.nodes[i].shownode = false;
        }
        this._reloadforce(false, 1000, 0);
        var i = 0, timer = null;

        function draw() {
            fn.graph.nodes[i].shownode = true;
            fn.graph.nodes[i].showline = true;
            fn._reloadforce(false, 500, 0);
            i++;
            if (i == fn.graph.nodes.length) {
                clearTimeout(timer);
                fn.mouseEvent();
                return;
            }
            timer = setTimeout(draw, 500);
        }
        draw();

    };

    /**
    * 显示来源线的颜色
    *   
    **/
    drawLineDetail() {
        var lineColor = this.lineColor,
            i = 1,
            w = 200,
            self = this,
            h = 30,
            xwidth = self.width - 20,
            jg = 100;
        var lg = d3.select("svg").append("g").attr("id", "line-detail");
        for (var color in lineColor) {
            if (!color.hasOwnProperty(lineColor)) {
                var name = '';
                switch (color) {
                    case 'friendcolor': name = "朋友"; break;;
                    case 'momentscolor': name = "朋友圈"; break;
                    case 'groupscolor': name = "微信群"; break;
                    case 'othercolor': name = "其他"; break;
                }
                lg.append("line")
                    .attr("x1", xwidth)
                    .attr("y1", h)
                    .attr("x2", xwidth - 100)
                    .attr("y2", h)
                    .attr("stroke", lineColor[color])
                    .attr("stroke-width", "3px")
                lg.append("text")
                    .attr("x", xwidth - 50)
                    .attr("y", h + 30)
                    .style("text-anchor", "middle")
                    .attr("fill", "#fff")
                    .text(name);
                xwidth -= 150;
            }
        }
    };
}

export default SpreadRouteChart;