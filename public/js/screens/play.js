game.Overlay = me.ImageLayer.extend({
    "init" : function (frames) {
        this.parent("static", c.WIDTH, c.HEIGHT, frames[0], Infinity, Infinity);
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

        me.input.bindKey(me.input.KEY.W,        "jump", true);
        me.input.bindKey(me.input.KEY.A,        "left");
        me.input.bindKey(me.input.KEY.D,        "right");

        me.input.bindKey(me.input.KEY.UP,       "jump", true);
        me.input.bindKey(me.input.KEY.LEFT,     "left");
        me.input.bindKey(me.input.KEY.RIGHT,    "right");

        // Load map
        me.levelDirector.loadLevel("test");

        // Add overlay
        me.game.world.addChild(new me.ImageLayer(
            "overlay",
            c.WIDTH,
            c.HEIGHT,
            "overlay",
            Infinity,
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

    end : function () {
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
