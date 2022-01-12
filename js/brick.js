// 砖块
class Brick {
    static width = 50
    static height = 20
    constructor(x, y, life = 1) {
        let bk = {
            x,                                              // x轴坐标
            y,                                              // y轴坐标
            w: Brick.width,                                    // 砖块宽度
            h: Brick.height,                                   // 砖块高度
            life,                                              // 砖块生命值
            alive: true,                                       // 是否存活
            drawImage: function (ctx, x, y, { life }) {
                ctx.strokeStyle = '#000'
                ctx.beginPath()
                ctx.strokeRect(x, y, 50, 20)
                if (life === 2) {
                    ctx.moveTo(x, y)
                    ctx.lineTo(x + 50, y + 20)
                    ctx.moveTo(x, y + 20)
                    ctx.lineTo(x + 50, y)
                    ctx.stroke()
                }
            }
        }
        Object.assign(this, bk)
    }
    // 消除砖块
    kill() {
        this.life--
        if (this.life === 0) {
            this.alive = false
        }
    }
    // 小球、砖块碰撞检测
    collide(ball) {
        let b = ball
        let bk = this
        if (Math.abs((b.x + b.w / 2) - (bk.x + bk.w / 2)) < (b.w + bk.w) / 2 &&
            Math.abs((b.y + b.h / 2) - (bk.y + bk.h / 2)) < (b.h + bk.h) / 2) {
            this.kill()
            return true
        } else {
            return false
        }
    }
    // 计算小球、砖块碰撞后x轴速度方向
    collideBrickHorn(ball) {
        let b = ball    // 小球
        let bk = this   // 砖块
        let rangeX = Math.abs((b.x + b.w / 2) - (bk.x + bk.w / 2))
        let rangeY = Math.abs((b.y + b.h / 2) - (bk.y + bk.h / 2))
        if (rangeX > bk.w / 2 && rangeX < (bk.w / 2 + b.w / 2) && rangeY < (bk.h / 2 + b.h / 2)) { // X轴方向与砖块四角相交
            if (b.x < bk.x && b.speedX > 0 || b.x > bk.x && b.speedX < 0) { // 小球在砖块左侧时
                return false
            } else { // 小球在砖块右侧
                return true
            }
        }
        return false
    }
}