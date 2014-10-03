(function() {
    var sessionId = window.localStorage.getItem('localuser') || 
        'A~' + Swarm.Spec.int2base((Math.random()*10000)|0);
    window.localStorage.setItem('localuser',sessionId);
    window.app = new window.TodoApp(sessionId);
}());
