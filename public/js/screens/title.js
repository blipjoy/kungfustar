game.TitleScreen = me.ScreenObject.extend({
    // TODO

    "onResetEvent" : function () {
        me.state.change(me.state.PLAY);
    },

    "onDestroyEvent" : function () {
    }
});
