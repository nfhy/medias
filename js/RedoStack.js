/**
 * Created by 农夫与花园 on 15/9/2.
 */
/**
 * 回放日志，上一步、下一步、添加日志，清空日志
 */
var RedoStack={
    _stack : new Array(),
    _cursor : -1,
    init : function(){
    },
    next : function(){
        if(this._cursor>=this._stack.length){
            return -1;
        }else{
            this._cursor++;
            return this._stack(this._cursor);
        }
    },
    previous : function(){
        if(this._stack >=0){
            this._cursor--;
            return this._stack(this._cursor);
        }else{
            return -1;
        }
    },
    push : function(redolog){
        this._stack.push(redolog);
        this._cursor++;
    },
    clear : function(){
        this._stack = new Array();
        this._cursor = -1;
    }

};

/**
 *回放日志数据结构
 */
var BFSRedoLog = function() {
    return {
        openListInThisStep: [],
        closeListInThisSetp: []
    }
};