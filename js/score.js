// 计分板
class Score {
  static SCORE_X = 10                         // 计分板默认x轴坐标
  static SCORE_Y = 20                         // 计分板默认y轴坐标
  constructor(game) {
    let s = {
      x: Score.SCORE_X * Game.UNIT,                   // x轴坐标
      y: Score.SCORE_Y * Game.UNIT,                   // y轴坐标
      text: '分数：',                                  // 文本分数
      textLv: '关卡：',                                // 关卡文本
      textLife: '生命：',                              // 生命文本
      score: 100,                                     // 每个砖块对应分数
      allScore: game.score?.allScore ?? 0,            // 总分
    }
    Object.assign(this, s)
  }
  // 计算总分
  computeScore() {
    this.allScore += this.score
  }
  // 清除总分
  clearScore() {
    this.allScore = 0
  }
}