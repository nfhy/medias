/**
 * Created by 农夫与花园 on 15/9/1.
 */

var gridDataDic = {};
var endGridKey = "";
var startGridKey = "";
var openList = [];
var closeList = [];
var changeList = [];
var twiceSize = false;
var basicClazz = "grid";
var initGrids = function(){
    basicClazz = twiceSize?"grid-double":"grid";
    var map = $(".map");
    var grid = $("<div>&nbsp;</div>").attr("class",basicClazz);
    var maxx = twiceSize?10:20;
    var maxy = twiceSize?15:30;
    for(var i = 0;i < maxx; i++){
        for(var j = 0;j < maxy; j++){
            map.append(grid.clone().addClass("grid-plain").attr({"x":j,"y":i}));
        }
    }
};

var refreshGrids = function(){
    allGrids().each(function(){
        $(this).attr("class",basicClazz+" grid-plain");
        $(this).text("");
    });
};

var allGrids = function(){
    return $(".map ."+basicClazz);
};

var singleGrid = function(x,y){
    return $(".map ."+basicClazz+"[x="+x+"][y="+y+"]");
}

var changeGridText = function(x,y,text){
    var grid = $(".map ."+basicClazz+"[x='"+x+"'][y='"+y+"']");
    grid.text(text);
};

var changeGridClazz = function(x,y,clazz){
    var grid = $(".map ."+basicClazz+"[x='"+x+"'][y='"+y+"']");
    grid.attr("class",basicClazz+" "+clazz);
};

var addGridClazz = function(x,y,clazz){
    var grid = $(".map ."+basicClazz+"[x='"+x+"'][y='"+y+"']");
    grid.addClass(clazz);
};

var setEnd = function(x,y){
    var key = x+","+y;
    endGridKey = key;
    var grid = gridDataDic[key];
    grid.state = GridState.endPoint;
    changeList.push(key);
};

/**
 * grid状态枚举
 * 0 无状态
 * 1 open
 * 2 close
 * 3 起始地点
 * 4 终点
 * 5 路径
 */
var GridState = {
    none: 0,
    open: 1,
    close: 2,
    startPoint: 3,
    endPoint: 4,
    inPath: 5,
    impassable: 6
};

var GridType = {
    plain: 0,
    forest: 1,
    hill: 2
};

var GridCost = {
    plain: 1,
    forest: 5,
    hill: 10
};

Array.prototype.contains = function(obj){
    for(var objkey in this){
        if(this[objkey]==obj){
            return true;
        }
    }
    return false;
};
Array.prototype.pushIfNotExists = function(obj){
    if(!this.contains(obj)){
        this.push(obj);
    }
};
Array.prototype.removeIndex = function(index){
    if(index>=0&&index<this.length)
        this.splice(index,1);
};
Array.prototype.removeVal = function(val){
    var index = -1;
    for(var index_ in this){
        if(this[index_] == val){
            index = index_;
            break;
        }
    }
    this.removeIndex(index);
};