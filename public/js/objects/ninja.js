game.Ninja = me.AnimationSheet.extend({
    // Workaround for a bug
    "renderable" : null,

    "init" : function (x, y) {
        this.parent(
            x,
            y,
            me.loader.getImage("ninja"),
            39
        );

        this.name = "ninja";
        this.anchorPoint.y = 1;

        var self = this;
        this.addAnimation("default", [ 0, 1 ], 250);
        this.setCurrentAnimation("default", function () {
            self.animationpause = true;
        });

        this.animationpause = true;
    },

    "update" : function () {
        var player_pos = game.playscreen.player.pos;
        if (player_pos.x < this.pos.x) {
            this.flipX(true);
        }
        else {
            this.flipX(false);
        }

        if (!Number.prototype.random(0, 150)) {
            me.game.world.addChild(me.entityPool.newInstanceOf(
                "game.NinjaStar",
                this.pos.x,
                this.pos.y + this.hHeight,
                this.pos.angle(player_pos)
            ));
            this.animationpause = false;
        }

        return this.parent();
    }
});
