(function () {

var melonham = me.plugin.Base.extend({
    "version" : "0.9.11",

    "plot" : function (p0, p1, callback) {
        var x0 = p0.x;
        var y0 = p0.y;
        var x1 = p1.x;
        var y1 = p1.y;

        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);

        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;

        var err = dx - dy;
        var e2 = 0;

        do {
            if (callback(x0, y0)) {
                return me.entityPool.newInstanceOf(
                    "me.Vector2d",
                    x0,
                    y0
                );
            }

            if (x0 === x1 && y0 === y1) {
                break;
            }

            e2 = err * 2;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (x0 === x1 && y0 === y1) {
                if (callback(x0, y0)) {
                    return me.entityPool.newInstanceOf(
                        "me.Vector2d",
                        x0,
                        y0
                    );
                }
                break;
            }

            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        } while (true);

        return null;
    },

    "collide" : function (p0, p1) {
        var tile = null;
        var map = me.game.collisionMap;

        function getTile(x, y) {
            if (x < 0 || y < 0 || x > map.cols || y > map.rows) {
                return null;
            }
            
            return map.layerData[x][y];
        }

        return this.plot(p0, p1, function (x, y) {
            tile = getTile(x, y);
            if (tile &&
                tile.tileset.getTileProperties(tile.tileId).isCollidable) {
                return true;
            }
            return false;
        });
    }
});

me.entityPool.add("me.Vector2d", me.Vector2d, true);
me.plugin.register(melonham, "melonham");

})();
