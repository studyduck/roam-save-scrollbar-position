window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION =
  window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION || {};

function getMainBox() {
  return document.querySelector(".rm-article-wrapper");
}

function getAllPagesTableBox() {
  return document.querySelector("#rm-all-pages-column-titles+div>div");
}

function getTopbar() {
  return document.querySelector(".rm-topbar");
}

function getRoamBlocks() {
  return document.querySelectorAll(".rm-article-wrapper .roam-block-container");
}

function getPageEntries() {
  return document.querySelectorAll(".rm-all-pages .table .rm-pages-row");
}

function getPageType() {
  const title = document.title;
  if (["Daily Notes", "Graph Overview", "All Pages"].includes(title)) {
    return title;
  } else if (location.href.includes("/page/")) {
    return "Page";
  }

  // Daily Notes        .rm-article-wrapper .roam-block-container
  // Page               .rm-article-wrapper .roam-block-container
  // All Pages          .rm-all-pages .table .rm-pages-row
  // Graph Overview     no scrollbar
}

function getScrollBox() {
  let box = null;
  const pageType = getPageType();
  if (pageType === "Daily Notes" || pageType === "Page") {
    box = getMainBox();
  } else if (pageType === "All Pages") {
    box = getAllPagesTableBox();
  }
  return box;
}

function getPageId() {
  const currentGraph = document.querySelector(".rm-db-title").textContent;
  const currentPage = location.href
    .replace(`https://roamresearch.com/#/app/${currentGraph}`, "")
    .replace("/page/", "");
  const pageType = getPageType();

  if (pageType === "Daily Notes" || pageType === "All Pages") {
    return `${currentGraph}/${pageType}`;
  } else if (pageType === "Page") {
    return `${currentGraph}/${currentPage}`;
  }
  return "";
}

function scrollPageReady(callback) {
  // when scrollPage is ready(Daily Notes/Page/All Pages), callback will be called, can get contents
  const pageType = getPageType();
  let getContTimer = null;
  let endTimer = null;

  const getPageContent = function (method) {
    const len = method().length;
    // console.log("get PageContent:", method.name, len);

    if (len) {
      clearInterval(getContTimer);
      clearTimeout(endTimer);
      callback();
    }
  };

  getContTimer = setInterval(() => {
    if (pageType === "Daily Notes" || pageType === "Page") {
      getPageContent(getRoamBlocks);
    } else if (pageType === "All Pages") {
      getPageContent(getPageEntries);
    }
  }, 10);

  endTimer = setTimeout(() => {
    clearInterval(getContTimer);
  }, 3000);
}

function debounce(func, wait, immediate = false) {
  let timer, result;
  return function () {
    const context = this;
    const args = arguments;
    const laterFn = function () {
      timer = null;
      if (!immediate) {
        result = func.apply(context, args);
      }
    };
    const callNow = immediate && !timer;

    clearTimeout(timer);
    timer = setTimeout(laterFn, wait);
    if (callNow) {
      result = func.apply(context, args);
    }
    return result;
  };
}

const saveScrollPosition = debounce(function () {
  // console.log("---scrollPage is ready, save ScrollPosition");

  const scrollBox = getScrollBox();

  window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION[getPageId()] =
      scrollBox.scrollTop;

  // console.log(
  //   "ROAM_SAVE_SCROLLBAR_POSITION data",
  //   window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION
  // );
}, 500);

function initScrollEvent() {
  // console.log("---scrollPage is ready, init ScrollEvent");

  setTimeout(() => {
    const scrollBox = getScrollBox();
    scrollBox.removeEventListener("scroll", saveScrollPosition);
    scrollBox.addEventListener("scroll", saveScrollPosition);
  }, 10);
}

function recoveryScrollPosition() {
  // console.log("---scrollPage is ready, recovery ScrollPosition");
  // console.log('window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION',window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION)

  const scrollBox = getScrollBox();
  const targetNum = window.ROAMRESEARCH_SAVE_SCROLLBAR_POSITION[getPageId()];


  if (!targetNum) {
    scrollBox.scrollTop = 0;
    initScrollEvent();
    return;
  }

  const step = 300;
  const timer = setInterval(() => {
    if (scrollBox.scrollTop + step < targetNum) {
      scrollBox.scrollTop += step;
    } else {
      scrollBox.scrollTop = targetNum;
      clearInterval(timer);
      initScrollEvent();
    }
  }, 10);
}

const handleUrlChange = debounce(function () {
  // console.log("---------route change---------");

  scrollPageReady(function () {
    // console.log("---scrollPage Ready---", getPageType());
    recoveryScrollPosition();
  });
}, 100);

function handleDbclickTopbar() {
  getScrollBox().scrollTop = 0;
}

// ----------------------------------------------

function onload() {
  // console.log("ROAM_SAVE_SCROLLBAR_POSITION onload");
  window.addEventListener("popstate", handleUrlChange);

  // getScrollBox().addEventListener("scroll", saveScrollPosition);
  scrollPageReady(function () {
    // console.log("---scrollPage Ready---first", getPageType());
    initScrollEvent();
  });

  getTopbar().addEventListener("dblclick", handleDbclickTopbar);
}
function onunload() {
  // console.log("ROAM_SAVE_SCROLLBAR_POSITION onunload");
  window.removeEventListener("popstate", handleUrlChange);

  getScrollBox().removeEventListener("scroll", saveScrollPosition);

  getTopbar().removeEventListener("dblclick", handleDbclickTopbar);
}

export default {
  onload,
  onunload,
};
