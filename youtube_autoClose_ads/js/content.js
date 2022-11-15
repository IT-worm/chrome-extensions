/* global chrome, fetch, Worker, localStorage, importScripts, formatter, linter, TextEncoder, crypto */



// 获取目标元素祖籍元素
function getParentElement({ node, hook }) {
  if (hook && typeof hook !== 'function') return;
  let times = 5;
  let targetElement;
  let currentNode = node;
  while (times > 0 && !targetElement && currentNode.parentNode) {
    if (typeof hook === 'function' && hook(currentNode.parentNode)) {
      targetElement = currentNode.parentNode;
    } else if (typeof hook === 'function' && !hook(currentNode.parentNode)) {
      currentNode = currentNode.parentNode;
    } else {
      targetElement = currentNode.parentNode;
    }
  }
}

// 目标元素停止滚动时执行callback
function scrollStop(target) {
  const { node = window, callback } = target || {};
  if (typeof node !== 'object') return;
  if (typeof node === 'object' && (node.nodeType !== 1 && node !== window)) return;

  let scrollY = node === window ? node.scrollY : node.scrollTop;
  let timer = null;
  node.onscroll = function () {
    const nodeScrollY = node === window ? node.scrollY : node.scrollTop;
    if (timer || scrollY === nodeScrollY) return;
    timer = setInterval(() => {
      if (nodeScrollY === scrollY) {
        // scroll stop
        if (typeof callback === 'function') callback();
        clearInterval(timer);
        timer = null;
      }
      scrollY = nodeScrollY;
    }, 500);
  }
}

// 为目标a标签添加_blank属性，并阻止冒泡
function addBlankStopPro({ box = document, className, optionNum = 1, hook }) {
  let targetATags = Array.from(box.getElementsByClassName(className));

  if (!targetATags || !targetATags.length) return;
  if (typeof optionNum === 'number') {
    targetATags = targetATags.slice(0, optionNum);
  }

  targetATags.forEach(targetATag => {

    if (!targetATag) return;
    if (targetATag.getAttribute('target') || !targetATag.getAttribute('href')) return;

    targetATag.setAttribute('target', '_blank');
    targetATag.addEventListener('click', (e) => { e.stopPropagation(); }, false);

    // if (stopFather) {
    //   const aFather = getParentElement({ node: targetATag, hook });
    //   if (aFather) aFather.addEventListener('click', (e) => { e.stopPropagation(); }, false);
    // }
  })
}


// 关闭广告
function closeAds() {
  let adTimer;
  if (adTimer) clearInterval(adTimer);

  adTimer = setInterval(() => {
    // 关闭插播广告
    const skipAd = document.querySelector('.ytp-ad-skip-button');
    if (skipAd) skipAd.click();

    // 关闭视频中小广告弹窗
    const adOverlay = document.querySelector('.ytp-ad-overlay-close-button');
    if (adOverlay) adOverlay.click();

    // 关闭主页会员订阅广告
    const dismissButton = document.getElementById('dismiss-button');
    if (dismissButton) dismissButton.click();
  }, 5000);
}

// 主页视频新开tab页
// 为a标签添加target=blank属性
// 阻止a标签及其父组件冒泡事件
function openInNewTab() {
  var wrapBox = document.getElementsByTagName('ytd-rich-item-renderer');
  Array.from(wrapBox).forEach(box => {
    // 图片
    addBlankStopPro({ box, className: 'yt-simple-endpoint inline-block style-scope ytd-thumbnail' });

    // avatar
    addBlankStopPro({ box, className: 'yt-simple-endpoint style-scope ytd-rich-grid-media' });

    // title
    addBlankStopPro({ box, className: 'yt-simple-endpoint focus-on-expand style-scope ytd-rich-grid-media' });

    // little title
    addBlankStopPro({ box, className: 'yt-simple-endpoint style-scope yt-formatted-string' });

    // shorts title
    addBlankStopPro({ box, className: 'yt-simple-endpoint focus-on-expand style-scope ytd-rich-grid-slim-media' });
  })
}

// 获取左侧导航栏目标祖级元素
function getMenuParentNode(node) {
  if (!node.getAttribute) return false;
  return node.getAttribute('id') === 'dismissible';
}

// 左侧导航栏
function guideMenuOpenInNewTab() {
  const addBlankStopProBind = () => addBlankStopPro({ className: 'yt-simple-endpoint style-scope ytd-guide-entry-renderer', optionNum: 'all', hook: getMenuParentNode });
  const guideMenu = document.getElementById('guide-inner-content');

  setTimeout(() => {
    addBlankStopProBind();
  }, 500);
  if (guideMenu) scrollStop({ node: guideMenu, callback: addBlankStopProBind });
}


async function init() {
  const href = window.location.href;
  if (!href.startsWith('https://www.youtube.com')) return;

  closeAds();
  scrollStop({ callback: openInNewTab });
  guideMenuOpenInNewTab();
  openInNewTab();
}

init();