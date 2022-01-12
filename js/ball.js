// 小球对象
class Ball {
    static width = 18                           // 小球宽度
    static height = 18                          // 小球高度
    constructor(g) {
        let b = {
            x: g.width / 2 - Ball.width / 2,     // x轴坐标
            y: g.paddle.y - Ball.height - 1,     // y轴坐标
            w: Ball.width,                       // 小球宽度
            h: Ball.height,                      // 小球高度
            speedX: 1,                           // x轴速度
            speedY: 5,                           // y轴速度
            fired: false,                        // 是否运动，默认静止不动
            drawImage: function (ctx, x, y) {
                ctx.beginPath()
                ctx.arc(x + 9, y + 9, 9, 0, Math.PI * 2, true)
                ctx.stroke()
            }
        }
        Object.assign(this, b)
    }
    move(game) {
        if (this.fired) {
            // 碰撞边界检测
            if (this.x < 0 || this.x > 1000 - Ball.width) {
                this.speedX *= -1
            }
            if (this.y < 0) {
                this.speedY *= -1
            }
            if (this.y > 500 - Ball.height) {
                // 生命 -1 游戏继续
                if (game.life > 1) {
                    game.life--
                    game.state = Game.STATE.CONTINUNE
                } else {
                    // 游戏结束
                    game.state = Game.STATE.GAMEOVER
                }
            }
            // 移动
            this.x -= this.speedX
            this.y -= this.speedY
        }
    }
}