/**
 * Created by 农夫与花园 on 15/9/5.
 */
var timer_dij = null;

$(function(){
    initGrids();
    $("#restart_DIJ").bind("click",function(){
        if(timer_dij){clearInterval(timer_dij);}
        DIJ.init();
    });
    allGrids().bind("mouseover",function(){
        if(timer_dij){
            var x = $(this).attr("x");
            var y = $(this).attr("y");
            DIJ.traceBackByParent(x,y);
        }
    });
});

var DIJ = {
    init : function(){
        refreshGrids();
        openList = [];
        closeList = [];
        gridDataDic = {};
        startGridKey = "";
        endGridKey = "";
        timer_dij = null;
        allGrids().each(function () {
            var gridObj = $(this);
            var x = gridObj.attr("x");
            var y = gridObj.attr("y");
            var key = x + "," + y;
            gridDataDic[key] = DIJ.GridData(x, y);
        });
        DIJ.setStart(10, 5);
        DIJ.setImpassable({"x": 5, "y": 0}, {"x": 6, "y": 7});
        DIJ.setImpassable({"x": 16, "y": 5}, {"x": 17, "y": 12});
        DIJ.setImpassable({"x": 25, "y": 7}, {"x": 26, "y": 14});
        DIJ.setImpassable({"x": 1, "y": 13}, {"x": 21, "y": 13});
        DIJ.setGridTypes(rectAngle(11,2,15,9),GridType.forest);
        DIJ.setGridTypes(rectAngle(22,5,29,5),GridType.forest);
        DIJ.setGridTypes(rectAngle(22,0,22,9),GridType.forest);
        DIJ.setGridTypes(rectAngle(12,5,13,7),GridType.hill);
        DIJ.setGridTypes(rectAngle(20,7,20,12),GridType.hill);
        DIJ.render();
        timer_dij = setInterval("DIJ.stepForward();", 1);
    },
    stepForward : function () {
        if (openList.length >= 1) {
            DIJ.run();
            DIJ.render();
        } else {
            if (timer_dij) {
                clearInterval(timer_dij);
            }
        }
    },
    traceBackByParent : function (x, y) {
        allGrids().removeClass("grid-inPath");
        var key = x + "," + y;
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
        DIJ.render();
    },
    run : function () {
        if (openList && openList.length >= 1) {
            openList.sort(function(a,b){
                var grida = gridDataDic[a];
                var gridb = gridDataDic[b];
                return grida.costNow-gridb.costNow;
            });
            var key = openList[0];
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
                    var isInList = closeList.contains(nearByGridKey);
                    var nearByGrid = gridDataDic[nearByGridKey];
                    if (nearByGrid.state == GridState.impassable) {
                        continue;
                    }
                    if (!isInList) {
                        if(!openList.contains(nearByGridKey)){
                            openList.push(nearByGridKey);
                            nearByGrid.state = GridState.open;
                        }
                        var newCost = grid.costNow + nearByGrid.selfCost;
                        if(newCost < nearByGrid.costNow){
                            nearByGrid.costNow = newCost;
                            nearByGrid.parent = key;
                        }
                        changeList.pushIfNotExists(nearByGridKey);
                    }
                }
            }
            openList.removeIndex(0);
            closeList.push(key);
            grid.state = GridState.close;
            changeList.pushIfNotExists(key);
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
            switch (grid.type){
                case GridType.plain:
                    break;
                case GridType.forest:
                    changeGridClazz(x,y,"grid-forest");
                    break;
                case GridType.hill:
                    changeGridClazz(x,y,"grid-hill");
                    break;
                default :break;
            }
            switch (grid.state){
                case GridState.none:
                    //changeGridClazz(x,y,"grid-plain");
                    break;
                case GridState.open:
                    if(grid.selfClass == "")
                        grid.selfClass = singleGrid(x,y).attr("class");
                    changeGridClazz(x,y,"grid-open");
                    break;
                case GridState.close:
                    if(grid.selfClass != "")
                        singleGrid(x,y).attr("class",grid.selfClass);
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
                    addGridClazz(x,y,"grid-inPath");
                    break;
                case GridState.impassable:
                    addGridClazz(x,y,"grid-impassable");
                    break;
                default:break;
            }
            if(grid.parent&&gridDataDic[grid.parent]){
                changeGridText(x,y,grid.costNow);
            }
        }
        changeList = [];
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
        grid.costNow = 0;
        openList.push(key);
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
    setGridType : function(x,y,type){
        var key = x+","+y;
        if(gridDataDic[key]){
            var grid = gridDataDic[key];
            grid.type = type;
            switch(type){
                case GridType.forest:
                    grid.selfCost = GridCost.forest;
                    break;
                case GridType.hill:
                    grid.selfCost = GridCost.hill;
                    break;
                case GridType.plain:
                    grid.selfCost = GridCost.plain;
                    break;
            }
            changeList.push(key);
        }
    },
    setGridTypes : function(rect,type){
      for(var x = rect.x1;x<=rect.x2;x++){
          for(var y = rect.y1;y<=rect.y2;y++){
              DIJ.setGridType(x,y,type);
          }
      }
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
            type : GridType.plain,
            costNow: 99999,
            selfCost: GridCost.plain,
            selfClass: ""
        }
    }

};


var rectAngle = function(x1,y1,x2,y2){
    return {"x1":x1,"y1":y1,"x2":x2,"y2":y2};
};
