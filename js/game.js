
// 游戏主要运行逻辑
class Game {
    static MAXLV = 4                     // 最终关卡
    static MAXLIFE = 3                   // 初始生命
    static fps = 60                      // 游戏运行帧数
    static FONT_SIZE = 48                // 字体大小
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
    width = null                         // canvas宽度
    height = null                        // canvas高度
    actions = {}                         // 记录按键动作
    keydowns = {}                        // 记录按键code
    static STATE = {
        START: Symbol('START'), // 开始游戏
        RUNNING: Symbol('RUNNING'), // 游戏运行中
        STOP: Symbol('STOP'), // 暂停游戏
        GAMEOVER: Symbol('GAMEOVER'), // 游戏结束
        UPDATE: Symbol('UPDATE'), // 游戏通关
        CONTINUNE: Symbol('CONTINUNE'), // 游戏继续
    }
    constructor() {
        const canvas = document.getElementById('canvas')
        const hintHeight = canvas.height / 2 - Game.FONT_SIZE / 2
        let g = {
            level: 1,                         // 初始为第一关
            life: Game.MAXLIFE,               // 初始有最多生命 
            state: Game.STATE.START,          // 初始默认为START
            canvas,                           // canvas元素
            context: canvas.getContext('2d'), // canvas画布
            width: canvas.width,              // canvas宽度
            height: canvas.height,            // canvas高度
            hintHeight,                       // 提示文字高度
        }
        Object.assign(this, g)
        this.#start()
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
        this.context.font = `${Game.FONT_SIZE}px Microsoft YaHei`
        this.context.fillStyle = '#000'
        this.context.fillText(label, (this.width - label.length * Game.FONT_SIZE) / 2, this.hintHeight) // 文案位置于正中
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
        this.context.font = `${Game.FONT_SIZE / 2}px Microsoft YaHei`
        this.context.fillStyle = '#000'
        // 绘制分数
        this.context.fillText(obj.text + obj.allScore, obj.x, obj.y)
        // 绘制关卡
        this.context.fillText(obj.textLv + this.level, this.canvas.width - 100, obj.y)
        // 绘制生命
        this.context.fillText(obj.textLife + this.life, this.canvas.width - 200, obj.y)
    }
    // 生命-1 游戏继续
    #gameContinue() {
        clearInterval(this.timer)
        this.life--
        this.paddle = new Paddle(this)
        this.ball = new Ball(this)
        this.state = Game.STATE.START
        this.#render()
    }
    // 游戏结束
    #gameOver() {
        // 清除定时器
        clearInterval(this.timer)
        // 清除画布
        this.#clear()
        // 绘制提示文字
        this.#drawLable(`游戏结束，总分${this.score.allScore}`)
    }
    // 游戏晋级
    #goodGame() {
        // 清除定时器
        clearInterval(this.timer)
        // 清除画布
        this.#clear()
        // 绘制提示文字
        this.#drawLable('恭喜晋级下一关卡')
    }
    // 游戏通关
    #finalGame() {
        // 清除定时器
        clearInterval(this.timer)
        // 清除画布
        this.#clear()
        // 绘制提示文字
        this.#drawLable(`恭喜通关全部关卡，总分${this.score.allScore}`)
        // 清除分数
        this.score.clearScore()
    }
    // 小球碰撞砖块检测
    checkBallBrick() {
        let p = this.paddle, b = this.ball
        // 小球碰撞挡板检测
        if (p.collide(b)) {
            // 当小球运动方向趋向挡板中心时，Y轴速度取反，反之则不变
            if (Math.abs(b.y + b.h / 2 - p.y + p.h / 2) > Math.abs(b.y + b.h / 2 + b.speedY - p.y + p.h / 2)) {
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
                        this.state = Game.STATE.UPDATE
                    }
                }
            })
        }
        // 挡板移动时边界检测
        if (p.x <= 0) { // 到左边界时
            p.isLeftMove = false
        } else {
            p.isLeftMove = true
        }
        if (p.x >= 1000 - p.w) { // 到右边界时
            p.isRightMove = false
        } else {
            p.isRightMove = true
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
        this.timer && clearInterval(this.timer)
        this.timer = setInterval(() => {
            // actions集合
            let actions = Object.keys(this.actions)
            for (let i = 0; i < actions.length; i++) {
                let key = actions[i]
                if (this.keydowns[key]) {
                    // 如果按键被按下，调用注册的action
                    this.actions[key]()
                }
            }
            // 判断游戏是否继续
            if (this.state === Game.STATE.CONTINUNE) {
                this.#gameContinue()
            }
            // 判断游戏是否结束
            if (this.state === Game.STATE.GAMEOVER) {
                this.#gameOver()
            }
            // 判断游戏运行中的事件
            if (this.state === Game.STATE.RUNNING) {
                // 检查小球和砖块/墙体是否相撞
                this.checkBallBrick()
                // 绘制游戏所有素材
                this.#paint()
            }
            if (this.state === Game.STATE.START) {
                // 绘制游戏所有素材
                this.#paint()
            }
            // 当前关卡挑战成功
            if (this.state === Game.STATE.UPDATE) {
                if (this.level === Game.MAXLV) { // 最后一关通关
                    // 挑战成功，渲染通关场景
                    this.#finalGame()
                } else { // 其余关卡通关
                    // 挑战成功，渲染下一关卡场景
                    this.#goodGame()
                }
            }
        }, 1000 / Game.fps)
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
                setTimeout(function () {
                    this.state = Game.STATE.RUNNING
                }, 100)
            } else { // 不可见状态
                this.state = Game.STATE.STOP
            }
        })
        const registerAction = (key, callback) => {
            this.actions[key] = callback
        }
        // 注册左方向键移动事件
        registerAction('ArrowLeft', () => {
            // 判断游戏是否处于运行阶段
            if (this.state === Game.STATE.RUNNING && this.paddle.isLeftMove) {
                this.paddle.moveLeft()
            }
        })
        // 注册右方向键移动事件
        registerAction('ArrowRight', () => {
            // 判断游戏是否处于运行阶段
            if (this.state === Game.STATE.RUNNING && this.paddle.isRightMove) {
                this.paddle.moveRight()
            }
        })
        // 设置键盘按下及松开相关注册函数
        window.addEventListener('keyup', (event) => {
            this.keydowns[event.code] = false
        })
        window.addEventListener('keydown', (event) => {
            this.keydowns[event.code] = true
            switch (event.code) {
                // 注册空格键发射事件
                case 'Space':
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
                        case Game.STATE.UPDATE:
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
                    break
            }
        })
    }

    /**
     * 开始当局游戏
     */
    #start() {
        //绑定事件
        this.#bindEvent()
        // 渲染
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