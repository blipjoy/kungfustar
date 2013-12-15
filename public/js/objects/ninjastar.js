game.NinjaStar = me.ObjectEntity.extend({
    "init" : function (x, y, dir) {
        this.parent(x, y, {
            "image" : "ninjastar",
            "spritewidth" : 48,
            "spriteheight" : 48
        });
        this.z = 15;
        this.alwaysUpdate = true;

        this.renderable.addAnimation(
            "default",
            [ 0, 1, 0, 2 ],
            Math.random * 500
        );
        this.renderable.setCurrentAnimation("default");

        this.dir = dir;
        this.speed = 8;

        // Animation
        this.tick = 0;
    },

    "update" : function () {
        if (!this.inViewport) {
            me.game.world.removeChild(this);
            return false;
        }

        var now = me.timer.getTime();
        if (now - this.tick > 16) {
            this.tick = now;

            this.renderable.angle += 0.17;

            this.pos.x += Math.cos(this.dir) * this.speed * me.timer.tick;
            this.pos.y += Math.sin(this.dir) * this.speed * me.timer.tick;

            me.game.world.collide(this);
        }

        return this.parent();
    }
})
