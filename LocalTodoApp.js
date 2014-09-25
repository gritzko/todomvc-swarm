var Swarm    = require('swarm');
var Spec     = Swarm.Spec;
var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');
var TodoApp  = require('./TodoApp');

module.exports = window.TodoApp = (function(superclass){
    var defaultModels = [];
    // TODO: default english version
    defaultModels.push({text:'распределенное приложение как локальное', completed: location.hash !== "#focused"});
    defaultModels.push({text:'всё очень быстро', completed: true});
    defaultModels.push({text:'теперь доступно каждому!', completed: true});

    var prototype = extend$((import$(S, superclass), S), superclass).prototype, constructor = S;

    function S(ssnid, itemId){
        this.path = [];
        this.ssnid = ssnid;
        this.moving = false;

        this.initSwarm();
        this.installListeners();
        this.parseUri();
        if (location.hash === '#focused') {
          this.selectItem(0);
        }
    }

    prototype.initSwarm = function () {
        this.storage = new Swarm.SharedWebStorage();
        this.storage.authoritative = true;
        this.host = Swarm.env.localhost =
            new Swarm.Host(this.ssnid,'',this.storage);
    };

    prototype.installListeners = function () {
        var self = this;
        document.addEventListener('keydown', function (ev) {
            switch (ev.keyCode) {
                // case 9:  self.forward();break; // tab
                // case 27: self.back();   break; // esc
                case 40: self.down();   break; // down arrow
                case 38: self.up();     break; // up arrow
                case 45: self.toggle(); break; // insert
                case 13: self.create(); break; // enter
                //case 46: self.delete(); break; // delete
                default: return true;
            }
            ev.preventDefault();
            return false;
        });
    };

    prototype.parseUri = function () {
        var hash = window.localStorage.getItem(".itemId");
        var path = window.localStorage.getItem(".listId");
        var idre = Spec.reQTokExt;
        idre.lastIndex = 0;
        var ml = idre.exec(path), listId = ml&&ml[2];
        idre.lastIndex = 0;
        var mi = idre.exec(hash), itemId = mi&&mi[2];
        if (!listId) {
            var list = new TodoList();
            var item = new TodoItem();
            list.addObject(item);
            listId = list._id;
            itemId = item._id;
        }
        this.forward(listId,itemId);
    };

    prototype.forward = function (listId, itemId) {
        var self = this;
        var fwdList;
        if (!listId) {
            var item = this.getItem();
            listId = item.childList;
        }
        if (!listId) {
            fwdList = new TodoList();
            listId = fwdList._id;
            item.set({childList: listId});
        } else {
            fwdList = this.host.get('/TodoList#'+listId); // TODO fn+id sig
        }
        // we may need to fetch the data from the server so we use a callback, yes
        fwdList.once('.init',function(){
            if (!fwdList.length()) {
                defaultModels.forEach(function(i){
                    fwdList.addObject(new TodoItem(i));
                })
            }
            itemId = itemId || fwdList.objectAt(0)._id;
            window.localStorage.setItem(".itemId", "#" + itemId);
            window.localStorage.setItem(".listId", "/" + listId);
            self.path.push({
                listId: listId,
                itemId: itemId
            });
            self.refresh();
        });
    };
  return S;
}(TodoApp));

function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
