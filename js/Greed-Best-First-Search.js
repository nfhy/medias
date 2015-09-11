/**
 * Created by 农夫与花园 on 15/9/6.
 */

var timer_gbf = null;
var findEnd = false;
$(function(){
    initGrids();
    $("#restart_GBF").bind("click",function(){
        if(timer_gbf){clearInterval(timer_gbf);}
        GBF.prepareToRunWhenResetEndPoint(22,13);
    });
    allGrids().bind("click",function(){
        if(timer_gbf){
            var x = $(this).attr("x");
            var y = $(this).attr("y");
            GBF.prepareToRunWhenResetEndPoint(x,y);
        }
    });
});
var GBF = {
    init : function () {
        refreshGrids();
        openList = [];
        closeList = [];
        gridDataDic = {};
        startGridKey = "";
        endGridKey = "";
        timer_gbf = null;
        findEnd = false;
        allGrids().each(function () {
            var grid = $(this);
            var x = grid.attr("x");
            var y = grid.attr("y");
            var key = x + "," + y;
            gridDataDic[key] = GBF.GridData(x, y);
        });
        GBF.setStart(10, 5);
        GBF.setImpassable({"x": 5, "y": 0}, {"x": 6, "y": 13});
        GBF.setImpassable({"x": 16, "y": 5}, {"x": 17, "y": 12});
        GBF.setImpassable({"x": 25, "y": 7}, {"x": 26, "y": 14});
        GBF.setImpassable({"x": 1, "y": 13}, {"x": 21, "y": 13});
        //GBF.render();
        //timer_gbf = setInterval("GBF.stepForward();", 1);
    },
    prepareToRunWhenResetEndPoint : function(x,y){
        GBF.init();
        GBF.setEnd(x,y);
        GBF.render();
        timer_gbf = setInterval("GBF.stepForward();", 1);
    },
    stepForward : function () {
        if (openList.length >= 1) {
            GBF.run();
            GBF.render();
        } else {
            if (timer_gbf) {
                clearInterval(timer_gbf);
            }
        }
    },
    traceBackByParent : function (key) {
        allGrids().removeClass("grid-inPath");
        var grid;
        while (startGridKey != key && gridDataDic[key]) {
            grid = gridDataDic[key];
            grid.state = GridState.inPath;
            changeList.push(key);
            key = grid.parent;
        }
        grid = gridDataDic[startGridKey];
        grid.state = GridState.inPath;
        changeList.push(startGridKey);
        GBF.render();
    },

    run : function () {
        if (openList && openList.length >= 1) {
            openList.sort(function(a,b){
                var grida = gridDataDic[a];
                var gridb = gridDataDic[b];
                return gridb.distanceToEnd-grida.distanceToEnd;
            });
            var key = openList.pop();
            var grid = gridDataDic[key];
            var x = grid.x;
            var y = grid.y;
            var keyOfDownGrid = x + "," + (parseInt(y) + 1);
            var keyOfUpGrid = x + "," + (y - 1);
            var keyOfLeftGrid = (x - 1) + "," + y;
            var keyOfRightGrid = (parseInt(x) + 1) + "," + y;
            var nearByGridKeys = [keyOfUpGrid, keyOfDownGrid, keyOfLeftGrid, keyOfRightGrid];
            for (var nearByGridKeyIndex in nearByGridKeys) {
                var nearByGridKey = nearByGridKeys[nearByGridKeyIndex];
                if (gridDataDic[nearByGridKey]) {
                    var isInList = openList.contains(nearByGridKey) || closeList.contains(nearByGridKey);
                    var nearByGrid = gridDataDic[nearByGridKey];
                    if (nearByGrid.state == GridState.impassable) {
                        continue;
                    }
                    if (!isInList) {
                        openList.push(nearByGridKey);
                        nearByGrid.state = GridState.open;
                        nearByGrid.parent = key;
                        nearByGrid.distanceToEnd = GBF.heuristic(nearByGridKey);
                        changeList.pushIfNotExists(nearByGridKey);
                    }
                    if(nearByGridKey == endGridKey){
                        GBF.traceBackByParent(nearByGridKey);
                        clearInterval(timer_gbf);
                        findEnd = true;
                        break;
                    }
                }
            }
            if(!findEnd) {
                closeList.push(key);
                grid.state = GridState.close;
                changeList.pushIfNotExists(key);
            }
        }
    },
    /**
     * 设置起点
     * @param x
     * @param y
     */
    setStart : function(x,y){
        var key = x+","+y;
        startGridKey = key;
        var grid = gridDataDic[key];
        grid.state = GridState.startPoint;
        openList.push(key);
        changeList.push(key);
    },
    setEnd : function(x,y){
        var key = x+","+y;
        endGridKey = key;
        var grid = gridDataDic[key];
        grid.state = GridState.endPoint;
        changeList.push(key);
    },
    setImpassable : function(fromPoint,toPoint){
        var x1 = fromPoint.x;
        var y1 = fromPoint.y;
        var x2 = toPoint.x;
        var y2 = toPoint.y;
        var i,key,grid;
        for(i = x1;i<=x2;i++){
            key = i+","+y1;
            grid = gridDataDic[key];
            grid.state = GridState.impassable;
            changeList.push(key);
        }
        for(i = y1;i<=y2;i++){
            key = x2+","+i;
            grid = gridDataDic[key];
            grid.state = GridState.impassable;
            changeList.push(key);
        }
    },
    /**
     * 渲染画面，open、close、start和end状态发生变化的都需要渲染
     */
    render : function(){
        for(var keyindex = 0;keyindex < changeList.length; keyindex++){
            var key = changeList[keyindex];
            var grid = gridDataDic[key];
            var x = grid.x;
            var y = grid.y;
            switch (grid.state){
                case GridState.none:
                    changeGridClazz(x,y,"grid-plain");
                    break;
                case GridState.open:
                    changeGridClazz(x,y,"grid-open");
                    //GBF.pointToParent(grid);
                    break;
                case GridState.close:
                    changeGridClazz(x,y,"grid-close");
                    break;
                case GridState.startPoint:
                    changeGridClazz(x,y,"grid-start");
                    changeGridText(x,y,"S");
                    break;
                case GridState.endPoint:
                    changeGridClazz(x,y,"grid-end");
                    changeGridText(x,y,"E");
                    break;
                case GridState.inPath:
                    changeGridClazz(x,y,"grid-inPath2");
                    break;
                case GridState.impassable:
                    addGridClazz(x,y,"grid-impassable");
                    break;
                default:break;
            }
        }
        changeList = [];
    },
    pointToParent : function (grid) {
        if (grid) {
            if (grid.parent) {
                var parentGrid = gridDataDic[grid.parent];
                var px = parentGrid.x;
                var py = parentGrid.y;
                var x = grid.x;
                var y = grid.y;
                if (x - px > 0) {
                    changeGridText(x, y, "←");
                } else if (px - x > 0) {
                    changeGridText(x, y, "→");
                } else if (y - py > 0) {
                    changeGridText(x, y, "↑");
                } else if (py - y > 0) {
                    changeGridText(x, y, "↓");
                }
            }
        }
    },
    heuristic : function(key){
        var x = parseInt(key.split(",")[0]);
        var y = parseInt(key.split(",")[1]);
        var endx = parseInt(endGridKey.split(",")[0]);
        var endy = parseInt(endGridKey.split(",")[1]);
        return Math.abs(x-endx)+Math.abs(y-endy);
    },
    /**
     *地图区块数据结构
     */
    GridData : function (_x, _y) {
        return {
            x: _x,
            y: _y,
            state: GridState.none,
            parent: "",
            distanceToEnd:0
        }
    }
};