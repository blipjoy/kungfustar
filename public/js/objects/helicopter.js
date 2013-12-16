game.Helicopter = me.LevelEntity.extend({
    "init" : function (x, y, settings) {
        settings.image = "helicopter";

        this.parent(x, y, settings);
    }
});
