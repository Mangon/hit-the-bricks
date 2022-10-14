import Brick from './brick.js'
import Game from './game.js'
import Panel from './panel.js'

// 定义关卡
export default class Level {
  constructor(g) {
    let s = {
      lv: g.level, // 游戏关卡
      width: g.width,
      height: g.height
    }
    Object.assign(this, s)
    return this.#initBrickList()
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
    const lv = this.lv, // 游戏关卡
      c_w = this.width, // canvas宽度
      c_h = this.height, // canvas高度
      xNum_max = Math.floor(c_w / (Brick.WIDTH * Game.UNIT)), // x轴砖块最大数量
      yNum_max = Math.floor((c_h - Panel.PANEL_Y * Game.UNIT - 5 * Game.UNIT) / (Brick.HEIGHT * Game.UNIT) / 2), // y轴砖块最大数量
      xNum = Math.min(xNum_max, 16), // x轴砖块第一层数量
      yNum = Math.min(yNum_max, 9)  // y轴砖块层数
    let x_start = 0, // x轴起始坐标，根据砖块数量浮动
      y_start = (Panel.PANEL_Y + 5 + Brick.HEIGHT) * Game.UNIT, // y轴起始坐标
      brickList = [],
      cNum = null // 当前行数
    switch (lv) {
      // case 1: // MARK: debug code
      // case 2:
      // case 3:
      // case 4:
      //   let arr = []
      //   arr.push({
      //     x: (xNum_max - 1) / 2 * 50 - 50,
      //     y: y_start + 20,
      //     type: 1,
      //   })
      //   brickList.push(arr)
      //   break
      case 1: // 正三角形
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0) {
            cNum = xNum - yNum
          } else {
            cNum += 1
          }
          x_start = (c_w - cNum * Brick.WIDTH * Game.UNIT) / 2 // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < cNum; k++) {
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
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0) {
            cNum = xNum
          } else {
            cNum -= 1
          }
          x_start = (c_w - cNum * Brick.WIDTH * Game.UNIT) / 2 // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < cNum; k++) {
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
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0) {
            cNum = xNum
          } else if (i > Math.floor(yNum / 2)) {
            cNum += 3
          } else {
            cNum -= 3
          }
          cNum = (cNum < 0) ? 0 : cNum;
          x_start = (c_w - cNum * Brick.WIDTH * Game.UNIT) / 2 // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < cNum; k++) {
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
        for (let i = 0; i < yNum; i++) {
          let arr = []
          // 修改每层x轴砖块数量
          if (i === 0 || i === yNum - 1) {
            cNum = xNum
            x_start = (c_w - cNum * Brick.WIDTH * Game.UNIT) / 2 // 修改每层x轴砖块起始坐标
            for (let k = 0; k < cNum; k++) {
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
              x: x_start + (xNum - 1) * Brick.WIDTH * Game.UNIT,
              y: y_start + i * Brick.HEIGHT * Game.UNIT,
              type: 2,
            })
          }
          brickList.push(arr)
        }
        break
      case 5: // 全砖块
        // 循环y轴
        for (let i = 0; i < yNum; i++) {
          let arr = []
          cNum = xNum
          x_start = (c_w - cNum * Brick.WIDTH * Game.UNIT) / 2 // 修改每层x轴砖块起始坐标
          // 循环x轴
          for (let k = 0; k < cNum; k++) {
            arr.push({
              x: x_start + k * Brick.WIDTH * Game.UNIT,
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
