window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION =
  window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION || {};

function debounce(func, wait, immediate = false) {
  var timer, result;
  return function () {
    var context = this;
    var args = arguments;
    var laterFn = function () {
      timer = null;
      if (!immediate) {
        result = func.apply(context, args);
      }
    };
    var callNow = immediate && !timer;

    clearTimeout(timer);
    timer = setTimeout(laterFn, wait);
    if (callNow) {
      result = func.apply(context, args);
    }
    return result;
  };
}

function getPageId() {
  var pageId = location.href;
  return pageId;
}

function getMainBox() {
  return document.querySelector(".rm-article-wrapper");
}

function getTopbar() {
  return document.querySelector(".rm-topbar");
}

var saveScrollPosition = debounce(function () {
  console.log("ROAM_SAVE_SCROLLBAR_POSITION save Scroll Position");

  var mainBox = getMainBox();

  if (
    !mainBox ||
    location.href.indexOf("/graph") > -1 ||
    location.href.indexOf("/search") > -1
  ) {
    return;
  }

  window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION[getPageId()] = mainBox.scrollTop;

  console.log(
    "ROAM_SAVE_SCROLLBAR_POSITION data",
    window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION
  );
}, 500);

function initScrollEvent(time) {
  setTimeout(() => {
    var mainBox = getMainBox();
    mainBox.removeEventListener("scroll", saveScrollPosition);
    mainBox.addEventListener("scroll", saveScrollPosition);
  }, time);
}

function recoveryScrollPosition() {
  var mainBox = getMainBox();
  var targetNum = window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION[getPageId()];

  if (!targetNum) {
    initScrollEvent(0);
    return;
  }

  var step = 300;
  var timer = setInterval(() => {
    if (mainBox.scrollTop + step < targetNum) {
      mainBox.scrollTop += step;
    } else {
      mainBox.scrollTop = targetNum;
      clearInterval(timer);
      initScrollEvent(0);
    }
  }, 10);
}

var handleUrlChange = debounce(function () {
  console.log("ROAM_SAVE_SCROLLBAR_POSITION url Change");
  var contentsLen = document.querySelectorAll(
    ".roam-article .roam-block-container"
  )?.length;

  if (contentsLen) {
    recoveryScrollPosition();
  }
}, 100);

function handleDbclickTopbar() {
  getMainBox().scrollTop = 0;
}

// ----------------------------------------------

function onload() {
  console.log("ROAM_SAVE_SCROLLBAR_POSITION onload");

  window.addEventListener("popstate", handleUrlChange);

  // getMainBox().addEventListener("scroll", saveScrollPosition);
  initScrollEvent(1000);

  getTopbar().addEventListener("dblclick", handleDbclickTopbar);
}
function onunload() {
  console.log("ROAM_SAVE_SCROLLBAR_POSITION onunload");

  window.removeEventListener("popstate", handleUrlChange);

  getMainBox().removeEventListener("scroll", saveScrollPosition);

  getTopbar().removeEventListener("dblclick", handleDbclickTopbar);
}

export default {
  onload,
  onunload,
};
