(function () {
    var canvas = document.getElementById('fx');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var FG = '232, 230, 227';
    var PINK = '185, 19, 79';
    var RADIUS = 110;   // cursor influence radius (px)
    var PUSH = 22;      // max repel distance (px)
    var DRIFT = 14;     // ambient wander amplitude (px)

    var w, h, dpr, points = [], t = 0;
    var mouse = { x: -9999, y: -9999, active: false };

    function build() {
        dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var count = Math.min(Math.round((w * h) / 55), 440);
        points = [];
        for (var i = 0; i < count; i++) {
            var x = Math.random() * w;
            var y = Math.random() * h;
            points.push({
                bx: x, by: y, x: x, y: y,
                // ambient drift: unique phase + speed per axis so field never syncs
                phx: Math.random() * 6.2832, phy: Math.random() * 6.2832,
                spx: 0.4 + Math.random() * 0.6, spy: 0.4 + Math.random() * 0.6
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        t += 0.008;
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            // wandering home target
            var hx = p.bx + Math.sin(t * p.spx + p.phx) * DRIFT;
            var hy = p.by + Math.cos(t * p.spy + p.phy) * DRIFT;
            var dx = p.x - mouse.x;
            var dy = p.y - mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var near = mouse.active && dist < RADIUS;

            if (near) {
                var f = (RADIUS - dist) / RADIUS;
                var inv = dist || 1;
                p.x += (dx / inv) * f * PUSH * 0.15;
                p.y += (dy / inv) * f * PUSH * 0.15;
            }
            // ease toward wandering home
            p.x += (hx - p.x) * 0.05;
            p.y += (hy - p.y) * 0.05;

            ctx.beginPath();
            ctx.arc(p.x, p.y, near ? 2.6 : 1.7, 0, 6.2832);
            ctx.fillStyle = 'rgba(' + (near ? PINK : FG) + ', ' + (near ? 0.9 : 0.32) + ')';
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    });
    window.addEventListener('mouseout', function () { mouse.active = false; });
    window.addEventListener('resize', build);

    build();
    if (reduced) {
        // static field, no animation
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 1.7, 0, 6.2832);
            ctx.fillStyle = 'rgba(' + FG + ', 0.32)';
            ctx.fill();
        }
    } else {
        draw();
    }
})();
