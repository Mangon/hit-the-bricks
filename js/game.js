
// 游戏主要运行逻辑
class Game {
  static MAXLV = 4                     // 最终关卡
  static MAXLIFE = 3                   // 初始生命
  static FPS = 60                      // 游戏运行帧数
  static FONT_SIZE = 32                // 字体大小
  level = null                         // 当前关卡
  life = null                          // 当前生命
  scene = null                         // 场景对象
  ball = null                          // 小球对象
  paddle = null                        // 挡板对象
  score = null                         // 计分板对象
  timer = null                         // 轮询定时器
  state = null                         // 游戏状态
  canvas = null                        // canvas元素
  context = null                       // canvas画布
  width = null                         // canvas元素宽度
  height = null                        // canvas元素高度
  actions = {}                         // 记录按键动作
  keydowns = {}                        // 记录按键code
  direciton = null                     // 设备方向 horizital 水平 vertical 垂直
  static STATE = {
    START: Symbol('START'), // 开始游戏
    RUNNING: Symbol('RUNNING'), // 游戏运行中
    STOP: Symbol('STOP'), // 暂停游戏
    GAMEOVER: Symbol('GAMEOVER'), // 游戏结束
    LEVEL_FINISH: Symbol('LEVEL_FINISH'), // 游戏通关
    CONTINUNE: Symbol('CONTINUNE'), // 游戏继续
  }
  constructor() {
    const canvas = document.getElementById('canvas')
    const direction = changeOrientation(canvas)
    const targetWidth = Math.max(window.innerWidth, window.innerHeight)
    const targetHeight = Math.min(window.innerWidth, window.innerHeight)
    canvas.style.width = `${targetWidth}px`
    canvas.style.height = `${targetHeight}px`
    const canvasComputedStyle = getComputedStyle(canvas, null)
    const elementWidth = parseInt(canvasComputedStyle['width'])
    const elementHeight = parseInt(canvasComputedStyle['height'])
    let g = {
      level: 1,                         // 初始为第一关
      life: Game.MAXLIFE,               // 初始有最多生命 
      state: Game.STATE.START,          // 初始默认为START
      canvas,
      context: canvas.getContext('2d'),
      width: elementWidth,
      height: elementHeight,
      direction,
      maxWidth: targetWidth,
    }

    // 高清屏处理
    canvas.width = elementWidth * devicePixelRatio
    canvas.height = elementHeight * devicePixelRatio
    g.context.scale(devicePixelRatio, devicePixelRatio)

    // 以游戏高度的 1/500 为基本长度单位
    Game.UNIT = canvas.height / 500
    Object.assign(this, g)
  }
  // 绘制页面所有素材
  #paint() {
    this.#clear() // 清除画布
    this.#drawPaddle() // 绘制挡板
    this.#drawBall() // 绘制小球
    this.#drawBricks() // 绘制砖块
    this.#drawScore() // 绘制分数
  }
  // 绘制文案
  #drawLable(label) {
    this.context.font = `${Game.FONT_SIZE * Game.UNIT}px Microsoft YaHei`
    this.context.fillStyle = '#000'
    this.context.fillText(label, (this.width - label.length * Game.FONT_SIZE * Game.UNIT) / 2, (this.height - Game.FONT_SIZE * Game.UNIT) / 2) // 文案位置于正中
  }
  // 绘制图形
  #drawImage(obj) {
    if (obj.drawImage) {
      obj.drawImage(this.context, obj.x, obj.y, obj)
      return
    }
    this.context.drawImage(obj.image, obj.x, obj.y)
  }
  // 绘制挡板
  #drawPaddle() {
    this.#drawImage(this.paddle)
  }
  // 绘制小球
  #drawBall() {
    this.#drawImage(this.ball)
  }
  // 绘制所有砖块
  #drawBricks() {
    const obj = this.scene.bricks
    for (let item of obj) {
      this.#drawImage(item)
    }
  }
  // 绘制计数板
  #drawScore() {
    const obj = this.score
    this.context.font = `${Game.FONT_SIZE * Game.UNIT / 2}px Microsoft YaHei`
    this.context.fillStyle = '#333'
    // 绘制分数
    this.context.fillText(obj.text + obj.allScore, obj.x, obj.y)
    // 绘制关卡
    this.context.fillText(obj.textLv + this.level, (this.width - Game.FONT_SIZE * Game.UNIT * 2), obj.y)
    // 绘制生命
    this.context.fillText(obj.textLife + this.life, (this.width - Game.FONT_SIZE * Game.UNIT * 4), obj.y)
  }
  // 生命-1 游戏继续
  #gameContinue() {
    this.life--
    this.paddle = new Paddle(this)
    this.ball = new Ball(this)
    this.state = Game.STATE.START
    this.#paint()
  }
  // 游戏结束
  #gameOver() {
    // 清除定时器
    cancelAnimationFrame(this.timer)
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLable(`游戏结束，总分${this.score.allScore}`)
  }
  // 游戏晋级
  #gameNext() {
    // 清除定时器
    cancelAnimationFrame(this.timer)
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLable('恭喜晋级下一关卡')
  }
  // 游戏通关
  #gameWin() {
    // 清除定时器
    cancelAnimationFrame(this.timer)
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLable(`恭喜通关全部关卡，总分${this.score.allScore}`)
  }
  // 小球碰撞砖块检测
  checkBallBrick() {
    let p = this.paddle, b = this.ball
    // 小球碰撞挡板检测
    if (p.collide(b)) {
      // 当小球运动方向趋向挡板中心时，Y轴速度取反，反之则不变
      if (Math.abs(b.y + b.d / 2 - p.y + p.h / 2) > Math.abs(b.y + b.d / 2 + b.speedY - p.y + p.h / 2)) {
        b.speedY *= -1
      } else {
        b.speedY *= 1
      }
      // 设置X轴速度
      b.speedX = p.collideRange(b)
    } else {
      // 小球碰撞砖块检测
      this.scene.bricks.forEach((item, i, arr) => {
        if (item.collide(b)) { // 小球、砖块已碰撞
          if (!item.alive) { // 砖块血量为0时，进行移除
            arr.splice(i, 1)
          }
          // 当小球运动方向趋向砖块中心时，速度取反，反之则不变
          if ((b.y < item.y && b.speedY < 0) || (b.y > item.y && b.speedY > 0)) {
            if (!item.collideBrickHorn(b)) {
              b.speedY *= -1
            } else { // 当小球撞击砖块四角时，Y轴速度不变
              b.speedY *= 1
            }
          } else {
            b.speedY *= 1
          }
          // 当小球撞击砖块四角时，X轴速度取反
          if (item.collideBrickHorn(b)) {
            b.speedX *= -1
          }
          // 计算分数
          this.score.computeScore()
          if (this.scene.bricks.length === 0) {
            this.state = Game.STATE.LEVEL_FINISH
          }
        }
      })
    }
    // 移动小球
    b.move(this)
  }
  // 设置逐帧动画
  #render() {
    this.scene = new Scene(this)
    this.paddle = new Paddle(this)
    this.ball = new Ball(this)
    this.score = new Score(this)
    const r = () => {
      // actions集合
      let actions = Object.keys(this.actions)
      for (let i = 0; i < actions.length; i++) {
        let key = actions[i]
        if (this.keydowns[key]) {
          // 如果按键被按下，调用注册的action
          this.actions[key]()
        }
      }
      switch (this.state) {
        case Game.STATE.CONTINUNE: // 判断游戏是否继续
          this.#gameContinue()
          break
        case Game.STATE.GAMEOVER: // 判断游戏是否结束
          this.#gameOver()
          break
        case Game.STATE.RUNNING: // 判断游戏运行中的事件
          // 检查小球和砖块/墙体是否相撞
          this.checkBallBrick()
          // 绘制游戏所有素材
          this.#paint()
          break
        case Game.STATE.START: // 游戏开始
          // 绘制游戏所有素材
          this.#paint()
          break
        case Game.STATE.LEVEL_FINISH: // 当前关卡挑战成功
          if (this.level === Game.MAXLV) { // 最后一关通关
            // 挑战成功，渲染通关场景
            this.#gameWin()
          } else { // 其余关卡通关
            // 挑战成功，渲染下一关卡场景
            this.#gameNext()
          }
          break
      }
      this.timer && cancelAnimationFrame(this.timer)
      this.timer = requestAnimationFrame(r)
    }
    this.timer = requestAnimationFrame(r)
  }
  // 清除画布
  #clear() {
    this.context.clearRect(0, 0, this.width, this.height)
  }
  /**
   * 初始化函数
   */
  #bindEvent() {
    const hiddenProperty = 'hidden' in document ? 'hidden' :
      'webkitHidden' in document ? 'webkitHidden' :
        'mozHidden' in document ? 'mozHidden' :
          null
    const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange')
    // 监听页面是否可见事件
    document.addEventListener(visibilityChangeEvent, () => {
      if (!document[hiddenProperty]) {  // 可见状态
        if (this.state === Game.STATE.STOP) {
          setTimeout(function () {
            this.state = Game.STATE.RUNNING
          }, 100)
        }
      } else { // 不可见状态
        if (this.state === Game.STATE.RUNNING) {
          this.state = Game.STATE.STOP
        }
      }
    })
    const arrowAction = (direction) => {
      return () => {
        switch (this.state) {
          case Game.STATE.RUNNING: // 游戏处于运行阶段
            if (this.paddle[`is${direction}Move`]) {
              this.paddle[`move${direction}`].call(this.paddle)
            }
            break;
          case Game.STATE.START: // 游戏处于开始阶段
            if (this.paddle[`is${direction}Move`]) {
              this.paddle[`move${direction}`].call(this.paddle)
              this.ball[`move${direction}`].call(this.ball, Paddle.SPEED)
            }
            break;
        }
      }
    }
    const spaceAction = () => {
      switch (this.state) {
        case Game.STATE.GAMEOVER:
          // 游戏结束时，重新开始
          this.#reset()
          this.state = Game.STATE.START
          this.#render()
          break
        case Game.STATE.RUNNING:
          // 暂停游戏
          this.state = Game.STATE.STOP
          break
        case Game.STATE.START:
        case Game.STATE.STOP:
          // 开始游戏/继续游戏
          this.ball.fired = true
          this.state = Game.STATE.RUNNING
          break
        case Game.STATE.LEVEL_FINISH:
          // 通关当前关卡
          if (this.level !== Game.MAXLV) {
            // 不为最终关卡时，进入下一关
            this.level++
            // 开始游戏
            this.state = Game.STATE.START
            // 初始化下一关卡
            this.#render()
          } else {
            // 已全部通关，重新开始
            this.#reset()
            this.state = Game.STATE.START
            this.#render()
          }
          break
      }
    }
    const registerAction = (key, callback) => {
      this.actions[key] = callback
    }
    // 注册左方向键移动事件
    registerAction('ArrowLeft', arrowAction('Left'))
    // 注册右方向键移动事件
    registerAction('ArrowRight', arrowAction('Right'))

    // 设置键盘按下及松开相关注册函数
    window.addEventListener('keyup', (event) => {
      this.keydowns[event.code] = false
    })
    window.addEventListener('keydown', (event) => {
      this.keydowns[event.code] = true
      switch (event.code) {
        // 注册空格键发射事件
        case 'Space':
          spaceAction()
          break
      }
    })
    // 设置手指按下及松开相关注册函数
    window.addEventListener('touchstart', (event) => {
      const x = (this.direction === 'horizontal' ? event.touches[0].clientX : event.touches[0].clientY)
      if (x < (this.maxWidth / 3)) {
        this.keydowns['ArrowLeft'] = true
      } else if (x > (this.maxWidth / 3 * 2)) {
        this.keydowns['ArrowRight'] = true
      } else {
        spaceAction()
      }
    })
    window.addEventListener('touchend', (event) => {
      this.keydowns['ArrowLeft'] = false
      this.keydowns['ArrowRight'] = false
    })
  }

  /**
   * 开始当局游戏
   */
  start() {
    // 绑定事件
    this.#bindEvent()
    // 渲染元素
    this.#render()
  }

  /**
   * 重置游戏
   */
  #reset() {
    this.score.clearScore()
    this.life = Game.MAXLIFE
    this.level = 1
  }
}