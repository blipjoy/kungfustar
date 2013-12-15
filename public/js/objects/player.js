game.GhostFrame = me.SpriteObject.extend({
    "init" : function (x, y, img, frame, z) {
        this.parent(x, y, img);
        this.z = z;
        this.size = 1;
        this.anchorPoint.set(0.5, 0.5);

        this.offset.setV(frame.offset);
        this.width = frame.width;
        this.height = frame.height;
        this.scale.x = frame.scaleX;
        this.scaleFlag = this.scale.x !== 1;
        
        new me.Tween(this)
            .to({
                "alpha" : 0,
                "size" : 1.25
            }, 200)
            .onUpdate(function () {
                this.resize(this.size);
            })
            .onComplete(function () {
                me.game.world.removeChild(this);
            })
            .start();
    }
})

game.Player = me.ObjectEntity.extend({
    "init" : function (x, y, settings) {
        settings.image = "player";
        settings.spritewidth = 16 * 3;
        settings.width = 16 * 3;
        settings.height = 21 * 3;

        this.parent(x, y, settings);

        this.setVelocity(1, 17);
        this.setMaxVelocity(5, 17);
        this.setFriction(0.6, 0);

        this.renderable.addAnimation("default", [ 0 ]);
        this.renderable.addAnimation("walk", [ 1, 2, 3 ]);
        this.renderable.addAnimation("jump", [ 4 ]);
        this.renderable.setCurrentAnimation("default");

        this.updateColRect(8, 32, -1, 0);

        me.game.viewport.follow(this);

        // Animation
        this.tick = me.timer.getTime();
        this.hPos = new me.Vector2d(
            this.pos.x + this.hWidth,
            this.pos.y + this.hHeight
        );

        game.playscreen.player = this;
    },

    "update" : function () {
        var redraw = false;
        var falling = this.falling || this.jumping;
        var sprinting = me.input.isKeyPressed("sprint");

        // Draw speed shadow
        var now = me.timer.getTime();
        if ((Math.abs(this.vel.x) > 6 ||
            Math.abs(this.vel.y) > 6) &&
            now - this.tick > 50) {
            this.tick = now;

            var frame = this.renderable.current.frame[
                this.renderable.current.idx
            ];
            frame.scaleX = this.renderable.scale.x;
            me.game.world.addChild(me.entityPool.newInstanceOf(
                "game.GhostFrame",
                this.pos.x,
                this.pos.y,
                this.renderable.image,
                frame,
                this.z
            ));
        }

        var self = this;
        function setPhysics() {
            if (sprinting) {
                // YUCK!
                self.setVelocity(1.5, 17);
                self.setMaxVelocity(7, 17);
                self.setFriction(0.95, 0);
            }
            else {
                self.setVelocity(1, 17);
                self.setMaxVelocity(5, 17);
                self.setFriction(0.6, 0);
            }
        }

        if (me.input.isKeyPressed("left")) {
            this.vel.x -= this.accel.x * me.timer.tick;
            this.flipX(true);
            if (!falling && !this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            redraw = true;
        }
        else if (me.input.isKeyPressed("right")) {
            this.vel.x += this.accel.x * me.timer.tick;
            this.flipX(false);
            if (!falling && !this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            redraw = true;
        }
        else if (!this.renderable.isCurrentAnimation("default")) {
            this.renderable.setCurrentAnimation("default");
            redraw = true;
        }

        if (me.input.isKeyPressed("jump")) {
            game.playscreen.rope && game.playscreen.rope.detach();
            if (!falling) {
                this.renderable.setCurrentAnimation("jump");
                this.jumping = true;
                this.vel.y = -this.accel.y * me.timer.tick;
                redraw = true;
            }
        }
        else if (falling && !this.renderable.isCurrentAnimation("jump")) {
            this.renderable.setCurrentAnimation("jump");
            redraw = true;
        }

        var col = this.updateMovement();

        // Update half-position
        this.hPos.x = this.pos.x + this.hWidth;
        this.hPos.y = this.pos.y + this.hHeight;

        // Limit movement to rope length
        var rope = game.playscreen.rope
        if (rope && rope.hit) {
            var delta = this.hPos.distance(rope.end) - rope.maxLength;
            if (delta > 0) {
                var angle = this.hPos.angle(rope.end);
                var vel = new me.Vector2d(
                    Math.cos(angle) * delta,
                    Math.sin(angle) * delta
                );
                this.pos.x += vel.x;
                this.pos.y += vel.y;

                this.vel.x += vel.x;
                this.vel.y += vel.y;

                this.falling = falling = (this.vel.y !== 0);
            }

            if (falling) {
                this.setVelocity(5, 17);
                this.setMaxVelocity(12, 17);
                this.setFriction(0.001, 0);
            }
            else {
                setPhysics();
            }
        }
        else {
            setPhysics();
        }

        if (this.vel.x || this.vel.y) {
            this.parent();
            return true;
        }

        return redraw;
    },

    "draw" : function (context) {
        this.parent(context);
    }
});
