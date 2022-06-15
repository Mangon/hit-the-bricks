// 定义场景
class Scene {
  bricks = null // 场景砖块实例
  constructor(g) {
    let s = {
      lv: g.level, // 游戏难度级别
      width: g.width,
      height: g.height,
      bricks: [] // 实例化所有砖块对象集合
    }
    Object.assign(this, s)
    this.bricks = this.#initBrickList()
  }
  // 实例化所有砖块对象
  #initBrickList() {
    const brickList = this.#creatBrickList()
    let arr = []
    for (let item of brickList) {
      for (let list of item) {
        let obj = new Brick(list.x, list.y, list.type)
        arr.push(obj)
      }
    }
    return arr
  }
  // 创建砖块坐标二维数组，并生成不同关卡
  #creatBrickList() {
    let lv = this.lv, // 游戏难度级别
      c_w = this.width, // canvas宽度
      c_h = this.height, // canvas高度
      xNum_max = c_w / (Brick.WIDTH * Game.UNIT), // x轴砖块最大数量
      yNum_max = c_h / (Brick.HEIGHT * Game.UNIT), // y轴砖块最大数量
      x_start = 0 * Game.UNIT, // x轴起始坐标，根据砖块数量浮动
      y_start = 30 * Game.UNIT // y轴起始坐标，默认从30起

    let brickList = [];
    switch (lv) {
      // case 1: // MARK: debug code
      // case 2:
      // case 3:
      // case 4:
      //     let arr = []
      //     arr.push({
      //         x: (xNum_max - 1) / 2 * 50 - 50,
      //         y: y_start + 20,
      //         type: 1,
      //     })
      //     brickList.push(arr)
      //     break
      case 1: // 正三角形
        var xNum = 16, // x轴砖块第一层数量
          yNum = 9 // y轴砖块层数
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0) {
            xNum = 1
          } else if (i === 1) {
            xNum = 2
          } else {
            xNum += 2
          }
          x_start = (xNum_max - xNum) / 2 * Brick.WIDTH * Game.UNIT // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < xNum; k++) {
            arr.push({
              x: x_start + k * Brick.WIDTH * Game.UNIT,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: i < 3 ? 2 : 1, // 前三排为特殊砖块
            })
          }
          brickList.push(arr)
        }
        break
      case 2: // 倒三角形
        var xNum = 16, // x轴砖块第一层数量
          yNum = 9 // y轴砖块层数
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === yNum - 1) {
            xNum = 1
          } else if (i === 0) {
            xNum = xNum
          } else {
            xNum -= 2
          }
          x_start = (xNum_max - xNum) / 2 * Brick.WIDTH * Game.UNIT // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < xNum; k++) {
            arr.push({
              x: x_start + k * Brick.WIDTH * Game.UNIT,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: i < 3 ? 2 : 1, // 前三排为特殊砖块
            })
          }
          brickList.push(arr)
        }
        break
      case 3: // 工字形
        var xNum = 16, // x轴砖块第一层数量
          yNum = 9 // y轴砖块层数
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0) {
            xNum = xNum
          } else if (i > 4) {
            xNum += 2
          } else {
            xNum -= 2
          }
          x_start = (xNum_max - xNum) / 2 * Brick.WIDTH * Game.UNIT // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < xNum; k++) {
            arr.push({
              x: x_start + k * Brick.WIDTH * Game.UNIT,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: i < 3 ? 2 : 1, // 前三排为特殊砖块
            })
          }
          brickList.push(arr)
        }
        break
      case 4: // 回字形
        var xNum = 16, // x轴砖块第一层数量
          yNum = 9 // y轴砖块层数
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0 || i === yNum - 1) {
            xNum = 16
            x_start = (xNum_max - xNum) / 2 * Brick.WIDTH * Game.UNIT
            for (let k = 0; k < xNum; k++) {
              arr.push({
                x: x_start + k * Brick.WIDTH * Game.UNIT,
                y: y_start + i * Brick.HEIGHT * Game.UNIT,
                type: 2,
              })
            }
          } else {
            arr.push({
              x: x_start,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: 2,
            }, {
              x: x_start + (16 - 1) * Brick.WIDTH * Game.UNIT,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: 2,
            })
          }
          brickList.push(arr)
        }
        break
    }
    return brickList;
  }
}
