// send tab info to iframe with localhost source
// create matching hints to switch to selected tab

if (tri.tabsiframe !== undefined) {
	tri.tabsiframe.showAndHint();
} else {
    tri.tabsiframe = {};

    const ti = tri.tabsiframe;

    // send custom css to iframe - replaces customstyle contents entirely in iframe html
    ti.customStyle = "";

    ti.sendStyle = function(style) {
        ti.iframe.contentWindow.postMessage(["style",style], ti.serverRoot);
    };

    // index of first tab to list
    ti.firsttab = 0;

    // have this use whatever port you're using on localhost (eg python http.server defaults to 8000)
    async function getServerRoot() {
        if (ti.serverRoot === undefined) {
            let port = tri.config.get("serverport") || await tri.excmds.composite("serverstart");
            ti.serverRoot = "http://localhost:" + port + "/hinttabs/";
        }
        return ti.serverRoot;
    };

    // control divs all need almost the same declaration
    function makeElem(tag, className="", id="", textContent="") {
        let elem = document.createElement(tag);
        if (className != "") { elem.className = className; }
        if (id !== "") { elem.id = id; }
        elem.textContent = textContent;
        return elem;
    };

    // left / right buttons to see more tabs + whatever else you'd like to map to tridactyl functions
    function makeControls() {
        let frag = document.createDocumentFragment();
        let ctrls = makeElem("div", "", "ctrls");

        ctrls.replaceChildren(
            makeElem("div", "TridactylTabHint ctrl", "prev", "<--"),
            makeElem("div", "TridactylTabHint ctrl", "next", "-->"),
            makeElem("div", "TridactylTabHint ctrl", "close", "X"),
            makeElem("div", "TridactylTabHint ctrl", "newtab", "+"),
            makeElem("div", "TridactylTabHint ctrl", "search", "search")
        );

        frag.appendChild(ctrls);

        return frag;
    };

	// hidden away but this callback calls hint() on first load
    // onload for css - don't send tabs unless iframe is also loaded
    function styleload() {
        ti.styleloaded = true;
        ti.maxcells(ti.tabslist.length);
        if (ti.iframeloaded === true) {
            ti.sendtabs();
        }

        ti.makehints().then(()=>{ti.hint();});
    };

    // onload for iframe - don't send tabs unless css is also loaded
    function iframeload() {
        ti.iframeloaded = true;
        ti.sendStyle(ti.customStyle);
        if (ti.styleloaded === true) {
            ti.sendtabs();
        }
    };

    // big old block of loading divs up (used to be split up but became a big blob while fixing stuff)
    async function loadElements(bTabAll = true) {
        const svrroot = await getServerRoot();
        const csssrc = svrroot + "hinttabs.css";
        const iframesrc = svrroot + "index.html";

        ti.tabslist = await tri.browserBg.tabs.query(bTabAll ? {} : {currentWindow:true});

        /* create dom elements */
        let frag = document.createDocumentFragment();

        ti.shadowHost = document.createElement("div");
        ti.shadowHost.id = "TridactylTabsHintIframe";

        let shadow = ti.shadowHost.attachShadow({ mode: "open" });
        let shadowStyle = document.createElement("link");

        shadow.appendChild(shadowStyle);
        shadowStyle.rel = "stylesheet";
        shadowStyle.type = "text/css";
        shadowStyle.href = csssrc;

        shadowStyle.onload = styleload;

        /* cover screen completely with this one */
        let dimmer = document.createElement("div");
        dimmer.id = "dimmer";
        dimmer.style["z-index"] = 2147483645;
        shadow.appendChild(dimmer);

        /* make the iframe & its parent divs */
        let iframeOuter = document.createElement("div");
        iframeOuter.className = "outermost iframe";
        iframeOuter.style.zIndex = 2147483646;

        let iframeAlign = document.createElement("div");
        iframeAlign.className = "gridalign";

        ti.iframe = document.createElement("iframe");
        ti.iframe.id = "tabsiframe";
        ti.iframe.src = iframesrc;
        ti.iframe.onload = iframeload;

        iframeOuter.appendChild(iframeAlign);
        iframeAlign.appendChild(ti.iframe);

        /* make hint grid divs */
        let gridOuter = document.createElement("div");
        gridOuter.className = "outermost hints";
        gridOuter.style.zIndex = 2147483645;

        let gridAlign = document.createElement("div");
        gridAlign.id = "shadow";
        gridAlign.className = "gridalign";

        ti.hintgrid = document.createElement("div");
        ti.hintgrid.id = "tabs";

        gridOuter.appendChild(gridAlign);
        gridAlign.appendChild(ti.hintgrid);
        gridAlign.appendChild(makeControls());

        shadow.appendChild(iframeOuter);
        shadow.appendChild(gridOuter);

        frag.appendChild(ti.shadowHost);

        document.documentElement.appendChild(frag);

        // observer to see what tridactyl's active hint is and message it to the iframe
        // I wonder if there's a quick way to get this through the tri object somewhere?
        ti.observerTarget = gridAlign;
        ti.observer = new MutationObserver(highlightActiveTab);
        ti.observer.observe(ti.observerTarget, { attributes: true, subtree: true });
    };

    // onload events will show tabs/hint from this
    loadElements();

    // messages iframe the index of the active hint in its parent div so active hint style can be used in the iframe
    function highlightActiveTab() {
        let activeTab = tri.tabsiframe.hintgrid.querySelector(".TridactylHintActive");

        // added an index attribute to speed this up
        if (activeTab) {
            tri.tabsiframe.iframe.contentWindow.postMessage(["highlight", activeTab.index], ti.serverRoot);
            return;
        }

        // sending a -1 removes the highlight
        tri.tabsiframe.iframe.contentWindow.postMessage(["highlight",-1], "*");
    }


    // mininum of max number of visible cells that could fit on the screen & total tabs to hint
    ti.maxcells = function(numTabs) {
        const computedStyle = getComputedStyle(ti.hintgrid);

        let top = ti.hintgrid.getBoundingClientRect().top;
        let cellHeightPx = parseFloat(computedStyle.backgroundSize);
        let maxRows = Math.max(1, Math.floor((innerHeight - top) / cellHeightPx));
        let numCols = computedStyle.gridTemplateColumns.split(" ").length;

        ti.maxVisibleCells = numCols * maxRows;

        let maxCells = Math.min(numTabs, numCols * maxRows);
        let numRows = Math.ceil(maxCells / numCols);

        // resize the iframe to fit in case the background isn't transparent
        ti.iframe.style.height = "calc("+numRows+"*"+"var(--tri-tabs-tab-spacing) - var(--tri-tabs-grid-gap))";
        ti.hintcount = maxCells;

        return maxCells;
    };

    // hintable elements with tab IDs as an attribute
    ti.makehints = async function() {
        let frag = document.createDocumentFragment();

        for (let i = 0; i < ti.hintcount; ++i) {
            let hint = document.createElement("div");
            hint.className = "tab TridactylTabHint";
            hint.tabid = ti.tabslist[i + ti.firsttab].id;
            hint.index = i;
            frag.appendChild(hint);
        }

        ti.hintgrid.replaceChildren(...frag.children);
    };

    // message iframe the tab array and number to display
    ti.sendtabs = function() {
        ti.iframe.contentWindow.postMessage(["newtabs", ti.tabslist, ti.hintcount], ti.serverRoot);
    };

    // update list of tabs to be current, repopulate appropriate divs/iframe content
    ti.refreshTabList = async function(bTabAll) {
        ti.tabslist = await tri.browserBg.tabs.query((bTabAll ? {} : {currentWindow:true}));
        ti.firsttab = 0;
        ti.hintcount = ti.maxcells(ti.tabslist.length);

        ti.sendtabs();
        ti.makehints();
    };

    // copied from tridactyl - open tab by its id
    ti.gototab = async function (tabId) {
        const tab = await tri.browserBg.tabs.update(tabId, { active: true });
        await tri.browserBg.windows.update(tab.windowId, { focused: true });
        return tab;
    };

    // change the start index of the tab list to get tab IDs for the hints
    ti.updatehints = function() {
        for (let i = 0; i < ti.hintcount; ++i) {
            ti.hintgrid.children[i].tabid = ti.tabslist[i + ti.firsttab].id;
            ti.hintgrid.children[i].index = i;
        }

        /* keep the same key presses by keeping excess hint elems in the grid */
        for (let i = ti.hintcount; i < ti.hintgrid.childElementCount; ++i) {
            ti.hintgrid.children[i].tabid = "fake";
            ti.hintgrid.children[i].index = i;
        }
    };

    ti.nextTabs = function() {
        let newstart = ti.firsttab + ti.hintgrid.childElementCount;

        if (newstart < ti.tabslist.length) {
            ti.firsttab = newstart;
            ti.hintcount = Math.min(ti.tabslist.length - newstart, ti.hintgrid.childElementCount);
            ti.updatehints();
            ti.iframe.contentWindow.postMessage(["range", newstart, ti.hintcount], ti.serverRoot);
        }

        ti.hint();
    };

    ti.prevTabs = function() {
        let newstart = ti.firsttab - ti.maxVisibleCells;

        if (newstart >= 0) {
            ti.firsttab = newstart;
            ti.hintcount = Math.min(ti.tabslist.length - newstart, ti.maxVisibleCells);
            ti.updatehints();
            ti.iframe.contentWindow.postMessage(["range", newstart, ti.hintcount], ti.serverRoot);
        }

        ti.hint();
    };

    ti.showAndHint = async function(bTabAll = true) {
        ti.observer.observe(ti.observerTarget, { attributes: true, subtree: true });
        ti.shadowHost.style.visibility = "visible";
        await ti.refreshTabList(bTabAll);
        ti.makehints().then((h)=>{ti.hint();});
    };

    ti.hide = function() {
        ti.shadowHost.style.visibility = "hidden";
        ti.observer.disconnect();
    };

    ti.hint = function() {
        tri.excmds.hint("-c", ".TridactylTabHint").then(function(t) {
            if (t === "") {
                ti.hide();
            } else if (t.tabid !== undefined) {
                if (t.tabid === "fake") {
                    ti.hint();
                } else {
                    ti.gototab(t.tabid);
                    ti.hide();
                }
            } else {
                switch(t.id) {
                    case "prev" : ti.prevTabs(); break;
                    case "next" : ti.nextTabs(); break;
                    case "close" : tri.excmds.tabclose(); break;
                    case "newtab" : tri.excmds.tabopen(); ti.hide(); break;
                    case "search" : tri.excmds.fillcmdline("taball"); ti.hide(); break;
                    default : ti.hide();
                }
            }
        });
    };
}
