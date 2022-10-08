import Game from '../js/game.js'

function getWelcomeTeml(welcomeState = Game.WELCOME_STATE.START) {
  const MENU = `
<div class="start ${welcomeState === Game.WELCOME_STATE.START ? 'selected' : ''}" data-event="start">开始游戏</div>
<div class="desc ${welcomeState === Game.WELCOME_STATE.DESC ? 'selected' : ''}" data-event="desc">游戏说明</div>
`

  const DESC = `
<div class="description">
  <p>使用 ArrowLeft 和 ArrowRight 控制滑板向左或者向右</p>
  <p>使用 Enter 或 Space 控制发射小球或暂停游戏或者进入下一关</p>
  <p>努力获取更高的分数</p>
</div>
<div class="back ${welcomeState === Game.WELCOME_STATE.BACK ? 'selected' : ''}" data-event="back">返回</div>
`

  return `
<div class="home">
  <div class="home-wraper">
    <div class="title">打砖块</div>
    <div class="content">
    ${welcomeState === Game.WELCOME_STATE.BACK ? DESC : MENU}
    </div>
  </div>
</div>
`
}
export { getWelcomeTeml }