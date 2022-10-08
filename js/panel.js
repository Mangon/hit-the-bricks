import Game from './game.js'

// 计分板
export default class Panel {
  static PANEL_X = 10                         // 计分板默认x轴坐标
  static PANEL_Y = 20                         // 计分板默认y轴坐标
  constructor(game) {
    let s = {
      x: Panel.PANEL_X * Game.UNIT,                   // x轴坐标
      y: Panel.PANEL_Y * Game.UNIT,                   // y轴坐标
      textScore: '分数：',                             // 文本分数
      textLv: '关卡：',                                // 关卡文本
      textLife: '生命：',                              // 生命文本
      draw: function(ctx) {
        ctx.font = `${Game.FONT_SIZE * Game.UNIT / 2}px Microsoft YaHei`
        ctx.fillStyle = '#333'
        // 绘制分数
        ctx.fillText(this.textScore + game.score, this.x, this.y)
        // 绘制关卡
        ctx.fillText(this.textLv + game.level, (game.width - Game.FONT_SIZE * Game.UNIT * 2), this.y)
        // 绘制生命
        ctx.fillText(this.textLife + game.life, (game.width - Game.FONT_SIZE * Game.UNIT * 4), this.y)
        ctx.moveTo(0, 0)
        ctx.lineTo(game.maxWidth, 0)
        ctx.lineTo(game.maxWidth, game.height)
        ctx.moveTo(0, 0)
        ctx.lineTo(0, game.height)
        ctx.lineTo(game.maxWidth, game.height)
        ctx.moveTo(0, game.maxHeight)
        ctx.lineTo(game.maxWidth, game.maxHeight)
        ctx.stroke()
      }
    }
    Object.assign(this, s)
  }
}
