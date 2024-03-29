import Panel from './panel.js'
import Paddle from './paddle.js'
import Level from './level.js'
import Ball from './ball.js'
import { getWelcomeTeml } from '../html/welcome.js'

// 游戏主要运行逻辑
export default class Game {
  static MAXLV = 5                     // 最终关卡
  static MAXLIFE = 3                   // 初始生命
  static FPS = 60                      // 游戏运行帧数
  static FONT_SIZE = 32                // 字体大小
  static BRICK_SCORE = 100             // 每个砖块对应分数
  level = null                         // 当前关卡
  life = null                          // 当前生命
  score = null                         // 当前分数
  scene = null                         // 关卡对象
  ball = null                          // 小球对象
  paddle = null                        // 挡板对象
  panel = null                         // 游戏板对象
  state = null                         // 游戏状态
  canvas = null                        // canvas元素
  context = null                       // canvas画布
  width = null                         // canvas元素宽度
  height = null                        // canvas元素高度
  actions = {}                         // 记录按键动作
  keydowns = {}                        // 记录按键code
  direciton = null                     // 设备方向 horizital 水平 vertical 垂直
  hint = null                          // 过关提示信息
  welcome = null                       // 欢迎界面
  timer = null                         // 渲染器轮询定时器
  renderer = null                      // 渲染器
  static STATE = {
    START: Symbol('START'), // 开始游戏
    RUNNING: Symbol('RUNNING'), // 游戏运行中
    STOP: Symbol('STOP'), // 暂停游戏
    GAMEOVER: Symbol('GAMEOVER'), // 游戏结束
    LEVEL_FINISH: Symbol('LEVEL_FINISH'), // 游戏通关
    CONTINUNE: Symbol('CONTINUNE'), // 游戏继续
    WELCOME: Symbol('WELCOME'), // 游戏初始
  }
  static WELCOME_STATE = {
    START: Symbol('START'), // 开始游戏
    DESC: Symbol('DESC'), // 游戏说明
    DESC_SELECT: Symbol('DESC_SELECT'), // 游戏说明返回上一级
    RANK: Symbol('RANK'), // 排行榜
    RANK_SELECT: Symbol('RANK_SELECT'), // 排行榜返回上一级
  }
  constructor() {
    this.canvas = document.getElementById('canvas')
    const { direction, width: maxWidth } = this.#changeOrientation(this.canvas)
    const { width, height } = this.#retinaAdaption(this.canvas)

    // 以canvas高度的 1/540 为基本长度单位
    Game.UNIT = this.canvas.height / 540

    let g = {
      level: 1,                         // 初始为第一关
      score: 0,                         // 初始分数为0
      life: Game.MAXLIFE,               // 初始有最多生命
      state: Game.STATE.WELCOME,          // 初始默认为WELCOME
      context: this.canvas.getContext('2d'),
      width,
      height,
      direction,
      maxWidth,
      maxHeight: (Panel.PANEL_Y + 5) * Game.UNIT
    }
    Object.assign(this, g)
  }
  // 强制横屏
  #changeOrientation(elem) {
    const width = window.innerWidth,
      height = window.innerHeight
    let direction = 'horizontal'
    if (width < height) {
      elem.style.width = `${height}px`
      elem.style.height = `${width}px`
      elem.style.transform = `rotate(90deg) translateY(-${width}px)`
      elem.style.transformOrigin = '0 0'
      direction = 'vertical'
    } else {
      elem.style.width = `${width}px`
      elem.style.height = `${height}px`
      elem.style.transform = `initial`
    }
    return { direction, width: parseInt(elem.style.width), height: parseInt(elem.style.height) }
  }
  // 高清屏幕适配
  #retinaAdaption(canvas) {
    const canvasComputedStyle = getComputedStyle(canvas, null)
    const elementWidth = parseInt(canvasComputedStyle['width'])
    const elementHeight = parseInt(canvasComputedStyle['height'])
    canvas.width = elementWidth * devicePixelRatio
    canvas.height = elementHeight * devicePixelRatio
    canvas.getContext('2d').scale(devicePixelRatio, devicePixelRatio)
    return { width: elementWidth, height: elementHeight }
  }
  // 绘制页面所有素材
  #paint() {
    this.#clear() // 清除画布
    this.#drawPaddle() // 绘制挡板
    this.#drawBall() // 绘制小球
    this.#drawBricks() // 绘制砖块
    this.#drawPanel() // 绘制分数
  }
  #drawLabel(label) {
    this.#drawLabelInH5(label)
  }
  // 以Canvas方式绘制文案
  #drawLabelInCavnas(label) {
    this.context.font = `${Game.FONT_SIZE * Game.UNIT}px Microsoft YaHei`
    this.context.fillStyle = '#000'
    this.context.fillText(label, (this.width - label.length * Game.FONT_SIZE * Game.UNIT) / 2, (this.height - Game.FONT_SIZE * Game.UNIT) / 2) // 文案位置于正中
  }
  // 以H5方式绘制文案
  #drawLabelInH5(label) {
    if (this.hint) {
      this.hint.innerText = label
      return
    }
    this.hint = document.createElement('div')
    this.hint.classList.add('hint')
    this.#changeOrientation(this.hint)
    this.hint.style.font = `${Game.FONT_SIZE * Game.UNIT}px Microsoft YaHei`
    this.hint.innerText = label
    document.body.insertBefore(this.hint, this.canvas)
  }
  #drawWelcome() {
    this.welcome = document.createElement('div')
    this.#changeOrientation(this.welcome)
    this.#renderWelcome(Game.WELCOME_STATE.START)
    document.body.insertBefore(this.welcome, this.canvas)
    this.welcome.addEventListener('click', (event) => {
      switch (event.target.dataset?.event) {
        case 'start':
          this.welcome.state = Game.WELCOME_STATE.START
          this.state = Game.STATE.START
          this.#initSprites()
          this.#render()
          break
        case 'desc':
          this.#renderWelcome(Game.WELCOME_STATE.DESC_SELECT)
          break
        case 'rank':
          this.#renderWelcome(Game.WELCOME_STATE.RANK_SELECT)
          break
        case 'back':
          this.#renderWelcome(Game.WELCOME_STATE.START)
          break
      }
    })
  }
  #renderWelcome(welcomeState) {
    this.welcome.state = welcomeState
    this.welcome.innerHTML = getWelcomeTeml(this.welcome.state)
  }
  // 绘制图形
  #draw(obj) {
    if (obj.draw) {
      obj.draw(this.context, obj.x, obj.y, obj)
      return
    }
    this.context.drawImage(obj.image, obj.x, obj.y) // 从图片加载
  }
  // 绘制挡板
  #drawPaddle() {
    this.#draw(this.paddle)
  }
  // 绘制小球
  #drawBall() {
    this.#draw(this.ball)
  }
  // 绘制所有砖块
  #drawBricks() {
    const obj = this.scene
    for (let item of obj) {
      this.#draw(item)
    }
  }
  // 绘制计数板
  #drawPanel() {
    this.#draw(this.panel)
  }
  #gameWelcome() {
    this.#drawWelcome()
  }
  // 生命-1 游戏继续
  #gameContinue() {
    this.life--
    this.paddle = new Paddle(this)
    this.ball = new Ball(this)
    this.state = Game.STATE.START
  }
  // 游戏结束
  #gameOver() {
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLabel(`游戏结束，总分${this.score}`)
    let rank = JSON.parse(localStorage.getItem('rank') ?? '[]')
      .sort((item1, item2) => { return item1.score > item2.score ? 1 : -1 })
    if (rank.length < 10 || rank[0]?.score < this.score) {
      setTimeout(() => {
        $('#form').modal()
      }, 0)
    }
  }
  submit() {
    const name = $('#name')[0].value
    const score = this.score
    let rank = JSON.parse(localStorage.getItem('rank') ?? '[]')
    rank.push({ name, score })
    rank = rank.sort((item1, item2) => { return item1.score > item2.score ? -1 : 1 })
      .splice(0, 10)
    localStorage.setItem('rank', JSON.stringify(rank))
    $.modal.close()
  }
  // 游戏晋级
  #gameNext() {
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLabel('恭喜晋级下一关卡')
  }
  // 游戏通关
  #gameWin() {
    // 清除画布
    this.#clear()
    // 绘制提示文字
    this.#drawLabel(`恭喜通关全部关卡，总分${this.score}`)
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
      this.scene.forEach((item, i, arr) => {
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
          this.score += Game.BRICK_SCORE
          if (this.scene.length === 0) {
            this.state = Game.STATE.LEVEL_FINISH
          }
        }
      })
    }
    // 移动小球
    b.move(this)
  }
  #render() {
    this.timer && cancelAnimationFrame(this.timer)
    this.timer = requestAnimationFrame(this.renderer)
  }
  #stopRender() {
    this.timer && cancelAnimationFrame(this.timer)
  }
  #initSprites() {
    this.scene = new Level(this)
    this.paddle = new Paddle(this)
    this.ball = new Ball(this)
    this.panel = new Panel(this)
  }
  // 设置逐帧动画
  #registerRenderer() {
    this.renderer = () => {
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
        case Game.STATE.WELCOME: // 游戏欢迎界面
          this.#gameWelcome()
          break
        case Game.STATE.CONTINUNE: // 游戏继续
          this.#gameContinue()
          this.#paint()
          this.#render()
          break
        case Game.STATE.GAMEOVER: // 游戏结束
          this.#stopRender()
          this.#gameOver()
          break
        case Game.STATE.RUNNING: // 游戏运行中的事件
          // 检查小球和砖块/墙体是否相撞
          this.checkBallBrick()
          // // 绘制游戏所有素材
          this.#paint()
          this.#render()
          break
        case Game.STATE.START: // 游戏开始
          // 绘制游戏所有素材
          this.#paint()
          this.#render()
          break
        case Game.STATE.LEVEL_FINISH: // 当前关卡挑战成功
          if (this.level === Game.MAXLV) { // 最后一关通关
            this.#stopRender()
            // 挑战成功，渲染通关场景
            this.#gameWin()
          } else { // 其余关卡通关
            this.#stopRender()
            // 挑战成功，渲染下一关卡场景
            this.#gameNext()
          }
          break
      }
    }
    this.timer = requestAnimationFrame(this.renderer)
  }
  // 清除画布 
  #clear() {
    if (this.hint) {
      this.hint.remove()
      this.hint = null
    }
    if (this.welcome) {
      this.welcome.remove()
      this.welcome = null
    }
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
          case Game.STATE.WELCOME: // 欢迎界面
            if (this.welcome.state !== Game.WELCOME_STATE.DESC_SELECT
              && this.welcome.state !== Game.WELCOME_STATE.RANK_SELECT) {
              const menuRank = [Game.WELCOME_STATE.START, Game.WELCOME_STATE.DESC, Game.WELCOME_STATE.RANK]
              const currentRank = menuRank.indexOf(this.welcome.state)
              const nextRank = direction === 'Up' ? menuRank[(currentRank - 1) < 0 ? 0 : (currentRank - 1)] : menuRank[(currentRank + 1) > 2 ? 2 : currentRank + 1]
              this.#renderWelcome(nextRank)
            }
            break
        }
      }
    }
    const spaceAction = () => {
      switch (this.state) {
        case Game.STATE.WELCOME:
          if (this.welcome.state === Game.WELCOME_STATE.START) {
            this.state = Game.STATE.START
            this.#initSprites()
            this.#render()
          } else if (this.welcome.state === Game.WELCOME_STATE.DESC) {
            this.#renderWelcome(Game.WELCOME_STATE.DESC_SELECT)
          } else if (this.welcome.state === Game.WELCOME_STATE.RANK) {
            this.#renderWelcome(Game.WELCOME_STATE.RANK_SELECT)
          } else {
            this.#renderWelcome(Game.WELCOME_STATE.START)
          }
          break
        case Game.STATE.GAMEOVER:
          // 游戏结束时，重新开始
          if ($.modal.isActive()) {
            return
          }
          this.#reset()
          this.state = Game.STATE.START
          this.#initSprites()
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
          this.#render()
          break
        case Game.STATE.LEVEL_FINISH:
          // 通关当前关卡
          if (this.level !== Game.MAXLV) {
            // 不为最终关卡时，进入下一关
            this.level++
          } else {
            // 已全部通关，重新开始
            this.#reset()
          }
          // 开始游戏
          this.state = Game.STATE.START
          this.#initSprites()
          // 初始化下一关卡
          this.#render()
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
        // 注册空格键事件
        case 'Space':
        case 'Enter':
          spaceAction()
          break
        case 'ArrowUp':
          arrowAction('Up')()
          break
        case 'ArrowDown':
          arrowAction('Down')()
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

    const windowChange = 'onorientationchange' in window ? 'orientationchange' : 'resize'

    window.addEventListener(windowChange, () => {
      // TODO: 进行中状态需要暂停；重新绘制
      const { direction, width: maxWidth } = this.#changeOrientation(this.canvas)
      const { width, height } = this.#retinaAdaption(this.canvas)
      Object.assign(this, { direction, maxWidth, width, height })
      if (this.hint) {
        this.#changeOrientation(this.hint)
      }
    })
  }

  /**
   * 开始当局游戏
   */
  start() {
    // 绑定事件
    this.#bindEvent()
    // 初始化实体
    this.#initSprites()
    // 注册渲染器
    this.#registerRenderer()
  }

  /**
   * 重置游戏
   */
  #reset() {
    this.score = 0
    this.life = Game.MAXLIFE
    this.level = 1
  }
}
