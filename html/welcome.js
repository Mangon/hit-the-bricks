import Game from '../js/game.js'

function getWelcomeTeml(welcomeState = Game.WELCOME_STATE.START) {
  const MENU = `
<div class="start ${welcomeState === Game.WELCOME_STATE.START ? 'selected' : ''}" data-event="start">开始游戏</div>
<div class="desc ${welcomeState === Game.WELCOME_STATE.DESC ? 'selected' : ''}" data-event="desc">游戏说明</div>
<div class="rank ${welcomeState === Game.WELCOME_STATE.RANK ? 'selected' : ''}" data-event="rank">排行榜</div>
`

  const BACK = `<div class="back selected" data-event="back">返回</div>`

  const DESC = `
<div class="description">
  <p>使用 ArrowLeft 和 ArrowRight 控制滑板向左或者向右</p>
  <p>使用 Enter 或 Space 控制发射小球或暂停游戏或者进入下一关</p>
  <p>努力获取更高的分数</p>
</div>
`

  const RANK_LIST = JSON.parse(localStorage.getItem('rank') ?? '[]').sort((item1, item2) => { return item1.score > item2.score ? -1 : 1 })
    .reduce((res, rankItem, idx) => {
      return res + `
<li class="rank-item">
  <div class="rank-rank">${idx + 1}</div>
  <div class="rank-content">
    <div class="rank-name">${rankItem.name}</div>
    <div class="rank-score">${rankItem.score} 分</div>
  </div>
</li>`
    }, '')

  const RANK = `
<div class="rank-list">${RANK_LIST}</div>
`

  return `
<div class="home">
  <div class="home-wraper">
    <div class="title">打砖块</div>
    <div class="content">
    ${welcomeState === Game.WELCOME_STATE.DESC_SELECT ? (DESC + BACK) : (
      welcomeState === Game.WELCOME_STATE.RANK_SELECT ? (RANK + BACK) : MENU
    )}
    </div>
    
  </div>
</div>
`
}
export { getWelcomeTeml }