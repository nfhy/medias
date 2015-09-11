/**
 * Created by 农夫与花园 on 15/9/6.
 */

var timer_ast = null;
var findEnd = false;
var diagonalDistance = 14;//diagonal movement cost
var distance = 10;//vertical or horizontal movement cost
var diagonalMove = true;//whether diagonal move allowed
$(function(){
    twiceSize = true;
    initGrids();
    $("#restart_AST").bind("click",function(){
        if(timer_ast){clearInterval(timer_ast);}
        AST.prepareToRunWhenResetEndPoint(14,9);
    });
    allGrids().bind("click",function(){
        if(timer_ast){
            var x = $(this).attr("x");
            var y = $(this).attr("y");
            AST.prepareToRunWhenResetEndPoint(x,y);
        }
    });
});
var AST = {
    init : function () {
        refreshGrids();
        openList = [];
        closeList = [];
        gridDataDic = {};
        startGridKey = "";
        endGridKey = "";
        timer_ast = null;
        findEnd = false;
        allGrids().each(function () {
            var grid = $(this);
            var x = grid.attr("x");
            var y = grid.attr("y");
            var key = x + "," + y;
            gridDataDic[key] = AST.GridData(x, y);
        });
        AST.setStart(0, 0);
        AST.setImpassable({"x": 5, "y": 0}, {"x": 6, "y": 8});
        AST.setImpassable({"x": 1, "y": 8}, {"x": 6, "y": 8});
        //AST.setImpassable({"x": 25, "y": 7},{"x": 26, "y": 14});
        //AST.setImpassable({"x": 1, "y": 13}, {"x": 21, "y": 13});
        //AST.render();
        //timer_ast = setInterval("AST.stepForward();", 1);
    },
    prepareToRunWhenResetEndPoint : function(x,y){
        AST.init();
        AST.setEnd(x,y);
        AST.render();
        timer_ast = setInterval("AST.stepForward();", 100);
    },
    stepForward : function () {
        if (openList.length >= 1) {
            AST.run();
            AST.render();
        } else {
            if (timer_ast) {
                clearInterval(timer_ast);
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
        AST.render();
    },

    run : function () {
        if (openList && openList.length >= 1) {
            openList.sort(function(a,b){
                var grida = gridDataDic[a];
                var gridb = gridDataDic[b];
                return gridb.costAll-grida.costAll;
            });
            var key = openList.pop();
            var grid = gridDataDic[key];
            var x = grid.x;
            var y = grid.y;
            var keyOfDownGrid = x + "," + (parseInt(y) + 1);
            var keyOfUpGrid = x + "," + (y - 1);
            var keyOfLeftGrid = (x - 1) + "," + y;
            var keyOfRightGrid = (parseInt(x) + 1) + "," + y;
            var nearByGridKeys;
            if(diagonalMove){
                var keyOfUpleft = (x-1)+","+(y-1);
                var keyOfUpright = (parseInt(x)+1)+","+(y-1);
                var keyOfDownleft = (x-1)+","+(parseInt(y)+1);
                var keyOfDownright = (parseInt(x)+1)+","+(parseInt(y)+1);
                nearByGridKeys = [keyOfUpGrid, keyOfDownGrid, keyOfLeftGrid, keyOfRightGrid, keyOfUpleft, keyOfUpright, keyOfDownleft, keyOfDownright];
            }
            else nearByGridKeys = [keyOfUpGrid, keyOfDownGrid, keyOfLeftGrid, keyOfRightGrid];
            for (var nearByGridKeyIndex in nearByGridKeys) {
                var nearByGridKey = nearByGridKeys[nearByGridKeyIndex];
                if (gridDataDic[nearByGridKey]) {
                    if(closeList.contains(nearByGridKey)){
                        continue;
                    }
                    var nearByGrid = gridDataDic[nearByGridKey];
                    if (nearByGrid.state == GridState.impassable) {
                        continue;
                    }
                    if (!openList.contains(nearByGridKey)) {
                        nearByGrid.state = GridState.open;
                        nearByGrid.parent = key;
                        nearByGrid.costNow = grid.costNow+(nearByGridKeyIndex>=4?diagonalDistance:distance);
                        nearByGrid.costAll = AST.heuristic(nearByGridKey)+nearByGrid.costNow;
                        changeList.pushIfNotExists(nearByGridKey);
                        openList.push(nearByGridKey);
                    }else{
                        var newCostNow = grid.costNow+(nearByGridKeyIndex>=4?diagonalDistance:distance);
                        if(newCostNow<nearByGrid.costNow){
                            nearByGrid.costNow = newCostNow;
                            nearByGrid.costAll = newCostNow + AST.heuristic(nearByGridKey);
                            nearByGrid.parent = key;
                            changeList.pushIfNotExists(nearByGridKey);
                           // openList.updateVal(nearByGridKey,nearByGrid.costAll);
                        }
                    }
                }
            }
            closeList.push(key);
            grid.state = GridState.close;
            changeList.pushIfNotExists(key);
            if(key == endGridKey){
                AST.traceBackByParent(key);
                clearInterval(timer_ast);
                findEnd = true;
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
            if(grid) {
                grid.state = GridState.impassable;
                changeList.push(key);
            }
        }
        for(i = y1;i<=y2;i++){
            key = x2+","+i;
            grid = gridDataDic[key];
            if(grid) {
                grid.state = GridState.impassable;
                changeList.push(key);
            }
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
                    changeGridText(x,y,"H:"+(grid.costAll-grid.costNow)+"\nF:"+grid.costAll);
                    //AST.pointToParent(grid);
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
        if(diagonalMove){
            var dx = Math.abs(x-endx);
            var dy = Math.abs(y-endy);
            return 10*(Math.abs(dx-dy))+14*Math.min(dx,dy);
        }else
            return (Math.abs(x-endx)+Math.abs(y-endy)*1.01)*distance;
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
            costNow:0,
            costAll:0
        }
    }
};