// 定义挡板对象
class Paddle {
  static height = 11 // 挡板默认高度
  static width = 51 // 挡板默认宽度
  static SPEED = 10 // x轴移动速度
  static BALL_SPEED_MAX = 8 // 小球反弹速度最大值
  constructor(g) {
    let w = Paddle.width * Game.UNIT
    let h = Paddle.height * Game.UNIT
    let p = {
      x: g.width / 2 - Paddle.width * Game.UNIT / 2, // x轴坐标
      maxX: g.width - Paddle.width * Game.UNIT,      // 最大x轴距坐标
      y: g.height - 20 * Game.UNIT, // y轴坐标
      w, // 挡板宽度
      h, // 挡板高度
      isLeftMove: true, // 能否左移
      isRightMove: true, // 能否右移
      draw: function (ctx, x, y) {
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
    this.#checkMovable()
  }
  moveRight() {
    this.x += Paddle.SPEED
    this.#checkMovable()
  }
  #checkMovable() {
    // 挡板移动时边界检测
    if (this.x <= 0) { // 到左边界时
      this.isLeftMove = false
    } else {
      this.isLeftMove = true
    }
    if (this.x >= this.maxX) { // 到右边界时
      this.isRightMove = false
    } else {
      this.isRightMove = true
    }
  }
  // 小球、挡板碰撞检测
  collide(ball) {
    let b = ball
    let p = this
    if (Math.abs((b.x + b.d / 2) - (p.x + Paddle.width * Game.UNIT / 2)) < (b.d + Paddle.width * Game.UNIT) / 2 &&
      Math.abs((b.y + b.d / 2) - (p.y + Paddle.height * Game.UNIT / 2)) < (b.d + Paddle.height * Game.UNIT) / 2) {
      return true
    }
    return false
  }
  // 计算小球、挡板碰撞后x轴速度值
  collideRange(ball) {
    let b = ball
    let p = this
    let rangeX = (p.x + Paddle.width * Game.UNIT / 2) - (b.x + b.d / 2)
    if (rangeX < 0) { // 小球撞击挡板左侧
      return rangeX / (b.d / 2 + Paddle.width * Game.UNIT / 2) * Paddle.BALL_SPEED_MAX
    } else if (rangeX > 0) { // 小球撞击挡板右侧
      return rangeX / (b.d / 2 + Paddle.width * Game.UNIT / 2) * Paddle.BALL_SPEED_MAX
    }
  }
}