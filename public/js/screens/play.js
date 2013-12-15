game.Overlay = me.ImageLayer.extend({
    "init" : function (frames) {
        this.parent("static", c.WIDTH, c.HEIGHT, frames[0], 1001, Infinity);
        this.floating = true;
        this.alpha = 0.25;

        this.frames = frames;
        this.tick = me.timer.getTime();
        this.count = 0;
    },
    
    "update" : function () {
        var now = me.timer.getTime();
        if (now - this.tick > 100) {
            this.tick = now;
            this.image = me.loader.getImage(this.frames[this.count++]);
            if (this.count >= this.frames.length) {
                this.count = 0;
            }
            return true;
        }
        return this.parent();
    }
})

game.PlayScreen = me.ScreenObject.extend({
    "onResetEvent" : function () {
        // Bind keys
        me.input.bindKey(me.input.KEY.SPACE,    "jump", true);
        me.input.bindKey(me.input.KEY.SHIFT,    "sprint");

        me.input.bindKey(me.input.KEY.A,        "left");
        me.input.bindKey(me.input.KEY.D,        "right");

        me.input.bindKey(me.input.KEY.LEFT,     "left");
        me.input.bindKey(me.input.KEY.RIGHT,    "right");

        this.mousedown = this.mousedown.bind(this);

        me.input.registerPointerEvent(
            "mousedown",
            me.game.viewport,
            this.mousedown
        );

        // Load map
        me.levelDirector.loadLevel("test");

        // Add overlay
        me.game.world.addChild(new me.ImageLayer(
            "overlay",
            c.WIDTH,
            c.HEIGHT,
            "overlay",
            1000,
            Infinity
        ));
        this.overlay = new game.Overlay([
            "static1",
            "static2",
            "static3",
            "static4"
        ]);
        me.game.world.addChild(this.overlay);

        // Handle pause
        me.event.subscribe(me.event.KEYDOWN, function (action, key) {
            if (key === "P".charCodeAt(0)) {
                if (me.state.isPaused()) {
                    me.state.resume();
                    me.event.publish(me.event.STATE_RESUME);
                }
                else {
                    me.state.pause();
                    me.event.publish(me.event.STATE_PAUSE);
                }
            }
        });

        var self = this;
        me.event.subscribe(me.event.STATE_PAUSE, function () {
            self.pause_overlay = new me.ColorLayer(
                "pause",
                "rgba(0, 0, 0, 0.5)",
                Infinity
            );
            self.pause_overlay.updateWhenPaused = true;
            me.game.world.addChild(self.pause_overlay);
        });

        me.event.subscribe(me.event.STATE_RESUME, function () {
            if (self.pause_overlay) {
                me.game.world.removeChild(self.pause_overlay);
                delete self.pause_overlay;
            }
        });
    },

    "onDestroyEvent" : function () {
        me.input.bindKey(me.input.KEY.SPACE);
        me.input.bindKey(me.input.KEY.SHIFT);
        me.input.bindKey(me.input.KEY.A);
        me.input.bindKey(me.input.KEY.D);
        me.input.bindKey(me.input.KEY.LEFT);
        me.input.bindKey(me.input.KEY.RIGHT);
        me.input.releasePointerEvent("mousedown", me.game.viewport);
    },

    "mousedown" : function (e) {
        if (me.state.isPaused()) {
            return;
        }

        var map = me.game.collisionMap;
        function getPoints() {
            var pos = game.playscreen.player.hPos;

            var v1 = new me.Vector2d(
                ~~(pos.x / map.tilewidth),
                ~~(pos.y / map.tileheight)
            );
            var v2 = new me.Vector2d(
                ~~(e.gameWorldX / map.tilewidth),
                ~~(e.gameWorldY / map.tileheight)
            );

            v2.sub(v1).normalize();
            v2.scale(new me.Vector2d(10, 10)).add(v1);

            return [
                v1.floorSelf(),
                v2.floorSelf(),
                pos,
                new me.Vector2d(
                    e.gameWorldX % map.tilewidth,
                    e.gameWorldY % map.tileheight
                )
            ];
        }

        var p = getPoints();
        var end = me.plugin.melonham.collide(p[0], p[1]);

        me.game.world.addChild(new game.Rope(
            p[2],
            (end || p[1])
                .scale(new me.Vector2d(map.tilewidth, map.tileheight))
                .add(p[3]),
            10 * 32, // MAGIC
            end !== null
        ));
    },

    "end" : function () {
        new me.Tween(this.overlay)
            .to({
                "alpha" : 1
            }, 5000)
            .onComplete(function () {
                me.game.viewport.fadeIn("#000", 500, function () {
                    me.state.change(me.state.PLAY);
                });
            }).start();
    }
});
