// 砖块
class Brick {
  static WIDTH = 25
  static HEIGHT = 10
  constructor(x, y, life = 1) {
    let bk = {
      x,                                              // x轴坐标
      y,                                              // y轴坐标
      w: Brick.WIDTH * Game.UNIT,                     // 砖块宽度
      h: Brick.HEIGHT * Game.UNIT,                    // 砖块高度
      life,                                           // 砖块生命值
      alive: true,                                    // 是否存活
      drawImage: function (ctx, x, y, { life }) {
        const RADIUS = 2 * Game.UNIT
        const WIDTH = Brick.WIDTH * Game.UNIT
        const HEIGHT = Brick.HEIGHT * Game.UNIT
        ctx.strokeStyle = '#000'
        ctx.beginPath()
        this.#drawBrickLayer(ctx, x, y, WIDTH, HEIGHT, RADIUS)
        if (life === 2) {
          this.#drawBrickLayer(ctx, x + RADIUS, y + RADIUS, WIDTH - 2 * RADIUS, HEIGHT - 2 * RADIUS, RADIUS)
        }
      }
    }
    Object.assign(this, bk)
  }
  // 绘制砖块层数
  #drawBrickLayer(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI)
    ctx.moveTo(x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI)
    ctx.moveTo(x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI)
    ctx.moveTo(x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI)
    ctx.moveTo(x, y)
    ctx.stroke()
  }
  // 消除砖块
  destory() {
    this.life--
    if (this.life === 0) {
      this.alive = false
    }
  }
  // 小球、砖块碰撞检测
  collide(ball) {
    let b = ball
    let bk = this
    if (Math.abs((b.x + b.d / 2) - (bk.x + bk.w / 2)) < (b.d + bk.w) / 2 &&
      Math.abs((b.y + b.d / 2) - (bk.y + bk.h / 2)) < (b.d + bk.h) / 2) {
      this.destory()
      return true
    } else {
      return false
    }
  }
  // 计算小球、砖块碰撞后x轴速度方向
  collideBrickHorn(ball) {
    let b = ball    // 小球
    let bk = this   // 砖块
    let rangeX = Math.abs((b.x + b.d / 2) - (bk.x + bk.w / 2))
    let rangeY = Math.abs((b.y + b.d / 2) - (bk.y + bk.h / 2))
    if (rangeX > bk.w / 2 && rangeX < (bk.w / 2 + b.d / 2) && rangeY < (bk.h / 2 + b.d / 2)) { // X轴方向与砖块四角相交
      if (b.x < bk.x && b.speedX > 0 || b.x > bk.x && b.speedX < 0) { // 小球在砖块左侧时
        return false
      } else { // 小球在砖块右侧
        return true
      }
    }
    return false
  }
}