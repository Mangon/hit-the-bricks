import Game from './game.js'
import Ball from './ball.js'

// 定义挡板对象
export default class Paddle {
  static HEIGHT = 11 // 挡板默认高度
  static WIDTH = 51 // 挡板默认宽度
  static SPEED = 10 // x轴移动速度
  static PADDING_BOTTOM = 20 // 挡板距底边距离
  constructor(g) {
    let w = Paddle.WIDTH * Game.UNIT
    let h = Paddle.HEIGHT * Game.UNIT
    let p = {
      x: g.width / 2 - w / 2, // x轴坐标
      y: g.height - Paddle.PADDING_BOTTOM * Game.UNIT, // y轴坐标
      maxX: g.width - w, // 最大x轴距坐标
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
    if (Math.abs((b.x + b.d / 2) - (p.x + p.w / 2)) < (b.d + p.w) / 2 &&
      Math.abs((b.y + b.d / 2) - (p.y + p.h / 2)) < (b.d + p.h) / 2) {
      return true
    }
    return false
  }
  // 计算小球、挡板碰撞后x轴速度值
  collideRange(ball) {
    let b = ball
    let p = this
    let rangeX = (p.x + p.w / 2) - (b.x + b.d / 2)
    if (rangeX < 0) { // 小球撞击挡板左侧
      return rangeX / (b.d / 2 + p.w / 2) * Ball.SPEED_MAX
    } else if (rangeX > 0) { // 小球撞击挡板右侧
      return rangeX / (b.d / 2 + p.w / 2) * Ball.SPEED_MAX
    }
  }
}
