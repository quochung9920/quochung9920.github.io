var _0x5f51=['scrollTop','radius','active','style','strokeStyle','resize','pos','closest','addEventListener','clientY','innerWidth','abs','getContext','easeInOut','getElementById','width','push','canvas','scrollLeft','length','moveTo','beginPath','circle','arc','height','pageY','rgba(156,217,249,','originY','body','main','pageX','scroll','innerHeight','clientX','mousemove','rgba(255,255,255,0.3)','color','draw','originX','random','pow','lineTo','fill','clearRect'];(function(_0x2b55d9,_0x5f51d5){var _0x227f03=function(_0x212b96){while(--_0x212b96){_0x2b55d9['push'](_0x2b55d9['shift']());}};_0x227f03(++_0x5f51d5);}(_0x5f51,0xc4));var _0x227f=function(_0x2b55d9,_0x5f51d5){_0x2b55d9=_0x2b55d9-0x0;var _0x227f03=_0x5f51[_0x2b55d9];return _0x227f03;};var width,height,largeHeader,canvas,ctx,points,target,animateHeader=!![];initHeader(),initAnimation(),addListeners();function initHeader(){var _0x45aeae=_0x227f;width=window[_0x45aeae('0x22')],height=window[_0x45aeae('0xc')],target={'x':width/0x2,'y':height/0x2},largeHeader=document[_0x45aeae('0x26')](_0x45aeae('0x9')),largeHeader[_0x45aeae('0x1b')]['height']=height+'px',canvas=document[_0x45aeae('0x26')](_0x45aeae('0x29')),canvas[_0x45aeae('0x27')]=width,canvas[_0x45aeae('0x4')]=height,ctx=canvas[_0x45aeae('0x24')]('2d'),points=[];for(var _0x212b96=0x0;_0x212b96<width;_0x212b96=_0x212b96+width/0x14){for(var _0x15e688=0x0;_0x15e688<height;_0x15e688=_0x15e688+height/0x14){var _0x1c4b8a=_0x212b96+Math[_0x45aeae('0x13')]()*width/0x14,_0x29ae21=_0x15e688+Math[_0x45aeae('0x13')]()*height/0x14,_0x2681cc={'x':_0x1c4b8a,'originX':_0x1c4b8a,'y':_0x29ae21,'originY':_0x29ae21};points[_0x45aeae('0x28')](_0x2681cc);}}for(var _0x57f7d1=0x0;_0x57f7d1<points[_0x45aeae('0x2b')];_0x57f7d1++){var _0x54e273=[],_0x5d8f78=points[_0x57f7d1];for(var _0x7d9fd1=0x0;_0x7d9fd1<points[_0x45aeae('0x2b')];_0x7d9fd1++){var _0x350675=points[_0x7d9fd1];if(!(_0x5d8f78==_0x350675)){var _0x1785da=![];for(var _0x8bfc67=0x0;_0x8bfc67<0x5;_0x8bfc67++){!_0x1785da&&(_0x54e273[_0x8bfc67]==undefined&&(_0x54e273[_0x8bfc67]=_0x350675,_0x1785da=!![]));}for(var _0x8bfc67=0x0;_0x8bfc67<0x5;_0x8bfc67++){!_0x1785da&&(getDistance(_0x5d8f78,_0x350675)<getDistance(_0x5d8f78,_0x54e273[_0x8bfc67])&&(_0x54e273[_0x8bfc67]=_0x350675,_0x1785da=!![]));}}}_0x5d8f78[_0x45aeae('0x1f')]=_0x54e273;}for(var _0x57f7d1 in points){var _0x4dfdab=new Circle(points[_0x57f7d1],0x2+Math[_0x45aeae('0x13')]()*0x2,_0x45aeae('0xf'));points[_0x57f7d1]['circle']=_0x4dfdab;}}function addListeners(){var _0x5a9ffa=_0x227f;!('ontouchstart'in window)&&window[_0x5a9ffa('0x20')](_0x5a9ffa('0xe'),mouseMove),window['addEventListener'](_0x5a9ffa('0xb'),scrollCheck),window[_0x5a9ffa('0x20')](_0x5a9ffa('0x1d'),resize);}function mouseMove(_0x37d4ad){var _0x109334=_0x227f,_0x3ce913=0x0,_0x45a401=0x0;if(_0x37d4ad[_0x109334('0xa')]||_0x37d4ad[_0x109334('0x5')])_0x45a401=_0x37d4ad['pageX'],_0x3ce913=_0x37d4ad[_0x109334('0x5')];else(_0x37d4ad[_0x109334('0xd')]||_0x37d4ad[_0x109334('0x21')])&&(_0x45a401=_0x37d4ad[_0x109334('0xd')]+document[_0x109334('0x8')][_0x109334('0x2a')]+document['documentElement'][_0x109334('0x2a')],_0x3ce913=_0x37d4ad[_0x109334('0x21')]+document['body'][_0x109334('0x18')]+document['documentElement'][_0x109334('0x18')]);target['x']=_0x45a401,target['y']=_0x3ce913;}function scrollCheck(){var _0x241fa9=_0x227f;if(document[_0x241fa9('0x8')]['scrollTop']>height)animateHeader=![];else animateHeader=!![];}function resize(){var _0xb5c4eb=_0x227f;width=window[_0xb5c4eb('0x22')],height=window[_0xb5c4eb('0xc')],largeHeader['style'][_0xb5c4eb('0x4')]=height+'px',canvas[_0xb5c4eb('0x27')]=width,canvas[_0xb5c4eb('0x4')]=height;}function initAnimation(){animate();for(var _0x2fb9d2 in points){shiftPoint(points[_0x2fb9d2]);}}function animate(){var _0x3e48e3=_0x227f;if(animateHeader){ctx[_0x3e48e3('0x17')](0x0,0x0,width,height);for(var _0x1e1753 in points){if(Math[_0x3e48e3('0x23')](getDistance(target,points[_0x1e1753]))<0xfa0)points[_0x1e1753][_0x3e48e3('0x1a')]=0.3,points[_0x1e1753]['circle']['active']=0.6;else{if(Math['abs'](getDistance(target,points[_0x1e1753]))<0x4e20)points[_0x1e1753][_0x3e48e3('0x1a')]=0.1,points[_0x1e1753][_0x3e48e3('0x2')][_0x3e48e3('0x1a')]=0.3;else Math[_0x3e48e3('0x23')](getDistance(target,points[_0x1e1753]))<0x9c40?(points[_0x1e1753][_0x3e48e3('0x1a')]=0.02,points[_0x1e1753]['circle'][_0x3e48e3('0x1a')]=0.1):(points[_0x1e1753][_0x3e48e3('0x1a')]=0x0,points[_0x1e1753][_0x3e48e3('0x2')][_0x3e48e3('0x1a')]=0x0);}drawLines(points[_0x1e1753]),points[_0x1e1753]['circle'][_0x3e48e3('0x11')]();}}requestAnimationFrame(animate);}function shiftPoint(_0x222b9b){var _0x15f5ed=_0x227f;TweenLite['to'](_0x222b9b,0x1+0x1*Math[_0x15f5ed('0x13')](),{'x':_0x222b9b[_0x15f5ed('0x12')]-0x32+Math['random']()*0x64,'y':_0x222b9b[_0x15f5ed('0x7')]-0x32+Math[_0x15f5ed('0x13')]()*0x64,'ease':Circ[_0x15f5ed('0x25')],'onComplete':function(){shiftPoint(_0x222b9b);}});}function drawLines(_0x598d0f){var _0x54e70c=_0x227f;if(!_0x598d0f[_0x54e70c('0x1a')])return;for(var _0x4666b4 in _0x598d0f['closest']){ctx['beginPath'](),ctx[_0x54e70c('0x0')](_0x598d0f['x'],_0x598d0f['y']),ctx[_0x54e70c('0x15')](_0x598d0f[_0x54e70c('0x1f')][_0x4666b4]['x'],_0x598d0f[_0x54e70c('0x1f')][_0x4666b4]['y']),ctx[_0x54e70c('0x1c')]=_0x54e70c('0x6')+_0x598d0f[_0x54e70c('0x1a')]+')',ctx['stroke']();}}function Circle(_0x2f35ad,_0x50b61c,_0x1f19b5){var _0x37ac3b=_0x227f,_0x18fde8=this;(function(){var _0x4d534a=_0x227f;_0x18fde8[_0x4d534a('0x1e')]=_0x2f35ad||null,_0x18fde8[_0x4d534a('0x19')]=_0x50b61c||null,_0x18fde8[_0x4d534a('0x10')]=_0x1f19b5||null;}(),this[_0x37ac3b('0x11')]=function(){var _0x2954af=_0x37ac3b;if(!_0x18fde8[_0x2954af('0x1a')])return;ctx[_0x2954af('0x1')](),ctx[_0x2954af('0x3')](_0x18fde8['pos']['x'],_0x18fde8[_0x2954af('0x1e')]['y'],_0x18fde8[_0x2954af('0x19')],0x0,0x2*Math['PI'],![]),ctx['fillStyle']=_0x2954af('0x6')+_0x18fde8[_0x2954af('0x1a')]+')',ctx[_0x2954af('0x16')]();});}function getDistance(_0x2a5742,_0x356a94){var _0x209b3f=_0x227f;return Math[_0x209b3f('0x14')](_0x2a5742['x']-_0x356a94['x'],0x2)+Math[_0x209b3f('0x14')](_0x2a5742['y']-_0x356a94['y'],0x2);}