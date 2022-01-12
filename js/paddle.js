// 定义挡板对象
class Paddle {
    static height = 22 // 挡板默认高度
    static width = 102 // 挡板默认宽度
    static SPEED = 10 // x轴移动速度
    static BALL_SPEED_MAX = 8 // 小球反弹速度最大值
    constructor(g) {
        let w = Paddle.width
        let h = Paddle.height
        let p = {
            x: g.width / 2 - Paddle.width / 2, // x轴坐标
            y: g.height - 50, // y轴坐标
            w, // 挡板宽度
            h, // 挡板高度
            isLeftMove: true, // 能否左移
            isRightMove: true, // 能否右移
            drawImage: function (ctx, x, y) {
                ctx.beginPath()
                ctx.arc(x + h / 2, y + h / 2, h / 2, Math.PI * 1.5, Math.PI / 2, true)
                ctx.lineTo(x + (w - h / 2), y + h)
                ctx.arc(x + (w - h / 2), y + h / 2, h / 2, Math.PI / 2, Math.PI * 1.5, true)
                ctx.closePath()
                ctx.stroke()
            }
        }
        Object.assign(this, p)
    }
    moveLeft() {
        this.x -= Paddle.SPEED
    }
    moveRight() {
        this.x += Paddle.SPEED
    }
    // 小球、挡板碰撞检测
    collide(ball) {
        let b = ball
        let p = this
        if (Math.abs((b.x + b.w / 2) - (p.x + p.w / 2)) < (b.w + p.w) / 2 &&
            Math.abs((b.y + b.h / 2) - (p.y + p.h / 2)) < (b.h + p.h) / 2) {
            return true
        }
        return false
    }
    // 计算小球、挡板碰撞后x轴速度值
    collideRange(ball) {
        let b = ball
        let p = this
        let rangeX = (p.x + p.w / 2) - (b.x + b.w / 2)
        if (rangeX < 0) { // 小球撞击挡板左侧
            return rangeX / (b.w / 2 + p.w / 2) * Paddle.BALL_SPEED_MAX
        } else if (rangeX > 0) { // 小球撞击挡板右侧
            return rangeX / (b.w / 2 + p.w / 2) * Paddle.BALL_SPEED_MAX
        }
    }
}