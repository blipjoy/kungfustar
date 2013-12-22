game.RopePart = me.ObjectEntity.extend({
    "init" : function (rope, id, max, z) {
        this.rope = rope;
        this.id = id;
        this.max = max;

        var step = id / max;
        var x = this.lerp(rope.start.x, rope.end.x, step) - 16;
        var y = this.lerp(rope.start.y, rope.end.y, step) - 16;

        this.parent(x, y, {
            "image" : "smoke",
            "spritewidth" : 32,
            "spriteheight" : 32
        });
        this.z = z;

        // Animation
        this.animating = false;
        this.renderable.size = 1;
    },

    "update" : function () {
        var rope = this.rope;
        var step = this.id / this.max;
        this.pos.x = this.lerp(rope.start.x, rope.end.x, step) - 16;
        this.pos.y = this.lerp(rope.start.y, rope.end.y, step) - 16;

        return true;
    },

    "draw" : function(context) {
        if (this.animating) {
            this.parent(context);
        }
    },

    "onCollision" : function () {
        if (this.rope.exploding) {
            this.collidable = false;
        }
        else {
            this.rope.detach(true);
        }
    },

    "lerp" : function (start, end, step) {
        var range = end - start;
        return range * step + start;
    },

    "explode" : function () {
        var self = this;
        this.animating = true;

        me.audio.play("explode");

        me.entityPool.newInstanceOf("me.Tween", this.renderable)
            .to({
                "alpha" : 0,
                "size" : 2
            }, 75)
            .onUpdate(function () {
                this.resize(this.size);
            })
            .onComplete(function () {
                me.game.world.removeChild(self);
            })
            .start();
    }
});

game.Rope = me.Renderable.extend({
    "init" : function (start, end, maxParts, hit, color) {
        var player = game.playscreen.player;
        var pos = new me.Vector2d();
        var w = 0;
        var h = 0;

        pos.x = Math.min(start.x, end.x);
        pos.y = Math.min(start.y, end.y);
        w = Math.max(start.x, end.x) - pos.x;
        h = Math.max(start.y, end.y) - pos.y;

        this.parent(pos, w, h);
        this.z = player.z;
        this.color = color || "#291D00";

        this.start = start;
        this.end = end;

        this.hit = hit;
        this.animEnd = start;

        this.animLength = 32;
        this.initLength = start.distance(end);
        this.maxParts = maxParts;
        this.maxLength = maxParts * 32;

        this.addParts();

        // Animation
        this.tick = 0;
        this.animDone = false;
        this.exploding = false;

        me.audio.play("rope");
        game.playscreen.rope && game.playscreen.rope.detach();
        game.playscreen.rope = this;
    },

    "update" : function () {
        this.adjust();

        if (this.animDone) {
            return false;
        }

        var now = me.timer.getTime();
        if (now - this.tick > 10) {
            this.tick = now;

            this.animLength += 32;
            if (this.animLength >= this.initLength) {
                this.animEnd = this.end;
                this.animDone = true;

                if (!this.hit) {
                    return this.detach();
                }

                return true;
            }

            this.animEnd = this.end.clone().sub(this.start);
            this.animEnd.normalize();
            this.animEnd.scale(
                new me.Vector2d(this.animLength, this.animLength)
            ).add(this.start);

            return true;
        }

        return false;
    },

    "draw" : function (context) {
        var player = game.playscreen.player;

        context.beginPath();
        context.lineWidth = 3;
        context.lineCap = "round";
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.animEnd.x, this.animEnd.y);
        context.strokeStyle = this.color;
        context.stroke();
        context.lineWidth = 1;
    },

    "destroy" : function () {
        this.removeParts();

        if (this.parent) {
            // ARGH!
            this.parent();
        }
    },

    "addParts" : function () {
        // Make a bunch of rope parts for collision detection
        this.parts = [];

        for (var i = 0; i < this.maxParts; i++) {
            var part = me.entityPool.newInstanceOf(
                "game.RopePart",
                this,
                i,
                this.maxParts,
                this.z
            );
            this.parts.push(part);
            me.game.world.addChild(part);
        }
    },

    "removeParts" : function () {
        if (!game.playscreen.resetting) {
            var exploding = this.exploding;
            this.parts.forEach(function (part) {
                if (exploding) {
                    setTimeout(function () {
                        part.explode();
                    }, Math.random() * 125);
                }
                else {
                    me.game.world.removeChild(part);
                }
            });
        }
        this.parts = [];
    },

    "adjust" : function () {
        var pos = me.entityPool.newInstanceOf("me.Vector2d");

        pos.x = Math.min(this.start.x, this.end.x);
        pos.y = Math.min(this.start.y, this.end.y);
        this.width = Math.max(this.start.x, this.end.x) - pos.x;
        this.height = Math.max(this.start.y, this.end.y) - pos.y;

        this.hWidth = this.width / 2;
        this.hHeight = this.height / 2;
    },

    "detach" : function (exploding) {
        this.exploding = exploding || false;

        if (game.playscreen.rope) {
            me.game.world.removeChild(this);
            game.playscreen.rope = null;
        }

        return false;
    }
});
