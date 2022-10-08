import Game from './game.js'

// 小球对象
export default class Ball {
  static DIAMETER = 9 // 小球直径
  static SPEED_MAX = 8 // 小球反弹速度最大值
  constructor(g) {
    const realDiameter = Ball.DIAMETER * Game.UNIT;
    let b = {
      x: g.width / 2 - realDiameter / 2,    // x轴坐标
      y: g.paddle.y - realDiameter - 1,     // y轴坐标
      minX: 0,                              // 最小x轴坐标
      maxX: g.width - realDiameter,         // 最大x轴坐标
      minY: g.maxHeight,                    // 最小y轴坐标
      maxY: g.height - realDiameter,        // 最大y轴坐标
      d: realDiameter,                      // 小球直径
      speedX: (g.width - realDiameter) / 800 * 3,                 // x轴速度
      speedY: (g.height - realDiameter - g.maxHeight) / 600 * 6, // y轴速度
      fired: false,                         // 是否运动，默认静止不动
      draw: function (ctx, x, y) {
        ctx.beginPath()
        ctx.arc(x + realDiameter / 2, y + realDiameter / 2, realDiameter / 2, 0, Math.PI * 2, true)
        ctx.stroke()
      }
    }
    Object.assign(this, b)
  }
  moveLeft(distance) {
    this.x -= distance
  }
  moveRight(distance) {
    this.x += distance
  }
  move(game) {
    if (this.fired) {
      // 碰撞边界检测
      if (this.x < this.minX || this.x > this.maxX) {
        this.speedX *= -1
      }
      if (this.y < this.minY) {
        this.speedY *= -1
      }
      // 移动
      this.x -= this.speedX
      this.y -= this.speedY
      // 球触底检测
      if (this.y > this.maxY) {
        if (game.life > 1) {
          // 游戏继续
          game.state = Game.STATE.CONTINUNE
        } else {
          // 游戏结束
          game.state = Game.STATE.GAMEOVER
        }
      }
    }
  }
}
