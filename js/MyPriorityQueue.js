/**
 * Created by 农夫与花园 on 15/9/9.
 */

function PQ(){
    this.data = {};
    this.priorityArr = [];
    this.push = push;
    this.pop = pop;
    this.contains = contains;
    this.updateVal = updateVal;
    this.length = length;
}

function length(){
    for(var key in this.data){
        var arr = this.data[key];
        if(arr&&arr.length>=1){
            return 1;
        }
    }
    return 0;
}

function push(obj,priorityVal){
    if(this.data.hasOwnProperty(priorityVal)){
        var arr = this.data[priorityVal];
        arr.push(obj);
    }else{
        var arr = [];
        arr.push(obj);
        this.data[priorityVal] = arr;
        this.priorityArr.push(priorityVal);
        this.priorityArr.sort();
    }
}

function pop(){
    var arr = this.data[this.priorityArr[0]];
    var re = arr.pop();
    if(arr.length == 0){
        this.priorityArr.pop();
    }
    return re;
}

function contains(obj){
    for(var key in this.data){
        var arr = this.data[key];
        if(arr&&arr.contains(obj)){
            return true;
        }
    }
    return false;
}

function remove(obj){
    for(var key in this.data){
        var arr = this.data[key];
        if(arr&&arr.contains(obj)){
            arr.removeVal(obj);
        }
    }
}

function updateVal(obj,priorityVal){
    this.remove(obj);
    this.push(obj,priorityVal);
}