/**
 * 横竖屏
 * @param {Object}
 */
function changeOrientation($print) {
  var width = document.documentElement.clientWidth
  var height = document.documentElement.clientHeight
  var direction = 'horizontal'
  if (width < height) {
    $print.width(height)
    $print.height(width)
    $print.css('transform', `rotate(90deg) translateY(-${width}px)`)
    $print.css('transform-origin', '0 0')
    direction = 'vertical'
  }

  // TODO: 适配窗口改变方向
  // var evt = "onorientationchange" in window ? "orientationchange" : "resize";

  // window.addEventListener(evt, function() {

  //     setTimeout(function() {
  //         var width = document.documentElement.clientWidth;
  //         var height =  document.documentElement.clientHeight;

  //         if( width > height ){
  //             $print.width(width);
  //             $print.height(height);
  //             $print.css('transform' , 'none');
  //         }
  //         else {
  //             $print.width(height);
  //             $print.height(width);
  //             $print.css('transform', `rotate(90deg) translateY(-${width}px)`);
  //             $print.css('transform-origin', '0 0');
  //         }
  //     }, 300);
  // }, false);
  return direction
}
