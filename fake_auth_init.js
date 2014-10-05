(function() {
    var sessionId = window.localStorage.getItem('localuser');
    if (!sessionId) {
        var rnd = Math.floor(Math.random()*(1<<30));
        sessionId = 'A~' + Swarm.Spec.int2base(rnd);
        window.localStorage.setItem('localuser',sessionId);
    }
    window.app = new window.TodoApp(sessionId);
}());
