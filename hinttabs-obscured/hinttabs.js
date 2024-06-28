command hinttabs js -dΩ
/* :hinttabs -a to show tabs from all windows */
if (tri.hinttabs) {
    tri.hinttabs.showAndHint(JS_ARGS[1] === "-a");
} else {
    tri.hinttabs = {};
    const h = tri.hinttabs;

    const cmdln = document.getElementById("cmdline_iframe");
    const cmdwin = cmdln.contentWindow;
    const cmddoc = cmdln.contentDocument;

    const staticDir = cmdwin.origin + "/static/";

    const theme = tri.config.get("theme");
    let customtheme = tri.config.get("customthemes")[theme] || "";
    const builtintheme = (customtheme === "" ?
        `<link rel="stylesheet" href="${staticDir+"themes/"+theme+"/"+theme+".css"}">` : "");

    /* so much css in the blob <head>! */
    /*
    it is possible to reuse a blob across tabs (of the same container), but most of the important stuff is done in onload
    and adding javascript to the iframe source might not be possible (haven't found a way anyway - csp)
    so not sure if retrieving the same blob (eg through tri.state) would be useful (apart from being kinda neat)
    */
    /* long string containing css and html for the blob / iframe source */
    const blob = new cmdwin.Blob([
        `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
   
   	<link rel="stylesheet" href="${staticDir}css/content.css">
    <link rel="stylesheet" href="${staticDir}css/hint.css">
    <link rel="stylesheet" href="${staticDir}css/commandline.css">
    ${builtintheme}

    <style>
/* tab hints vars - can be overwritten by tridactyl theme */
:root {
    --tritab-font-size: 9pt;
    --tritab-font-family: var(--tridactyl-cmplt-font-family);
    
    /* iframe's body colour */
    --tritab-dimmer-bg: var(--tridactyl-bg);
    --tritab-dimmer-opacity: 0.85;
    
    --tritab-total-width: 80%;
    
    /* left padding - leave enough room that the hint spans don't overlap tab info */
    /* I've added a span with class TridactylHint and text ZZ to use as the margin instead */
    --tritab-hintspan-padding: 0;
    
    --tritab-max-tabs: 20;
    /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
    --tritab-max-cols: 4;
    --tritab-col-min-width: 400px;
    
    --tritab-fg: var(--tridactyl-cmplt-fg);
    --tritab-bg: var(--tridactyl-cmplt-bg);
    
    --tritab-url-fg: var(--tridactyl-url-fg);
    --tritab-url-bg: none;
    --tritab-url-decoration: var(--tridactyl-url-text-decoration);
    
    --tritab-outline-color: var(--tridactyl-cmplt-fg);
    --tritab-incognito-outline-color: #8000d7;
    
    --tritab-faketab-outline: dimgrey;
    --tritab-faketab-bg: var(--tritab-bg);
    
    --tritab-ctrl-fg: var(--tridactyl-cmdl-fg);
    --tritab-ctrl-bg: var(--tridactyl-cmdl-bg);
    --tritab-ctrl-outline-color: var(--tridactyl-cmdl-fg);
    	
    --tritab-active-fg: var(--tridactyl-of-fg);
    --tritab-active-bg: var(--tridactyl-of-bg);
    --tritab-active-outline-color: var(--tridactyl-of-fg);
    --tritab-active-decoration: underline;
    	
    --tritab-url-active-fg: var(--tridactyl-of-fg);
    --tritab-url-active-bg: none;
    
    --tritab-ctrl-active-fg: var(--tridactyl-of-fg);
    --tritab-ctrl-active-bg: var(--tridactyl-of-bg);
    --tritab-ctrl-active-outline-color: var(--tridactyl-of-fg);
    --tritab-ctrl-active-decoration: underline;
    
    /* these affect the placement of the grid items */
    --tritab-title-font-size: 1em;
    --tritab-url-font-size: 1em;
    
    --tritab-line-height: 1.4em;
    --tritab-grid-gap: 0.4em;
    
    --tritab-padding-top: 0.5em;
    --tritab-padding-bottom: 0.5em;
    
    --tritab-icon-size: 1em;
    
    --tritab-ctrls-top: 20px;
    --tritab-ctrls-tabs-gap: 0.5em;
    --tritab-ctrls-height: 1.5em;
    
    --tritab-tabs-top: calc(var(--tritab-ctrls-top) + var(--tritab-ctrls-tabs-gap));
    
    /**
    * Calculated values.
    */
    
    /* these few vars are used to calculate how many rows can fit on the screen, which is handy when it comes to the js part */
    --calc-cell-height: calc( max( var(--tritab-line-height), var(--tritab-title-font-size), var(--tritab-icon-size) ) + max( var(--tritab-line-height), var(--tritab-url-font-size), var(--tritab-icon-size) ) );
    --calc-cell-height-padded: calc(var(--calc-cell-height) + var(--tritab-padding-top) + var(--tritab-padding-bottom));
    
    /* this gives the distance between rows, including gap size and padding */
    /* used to set background-size which makes it a pixel value, which can be found through getComputedStyle() */
    --calc-row-spacing: calc(var(--calc-cell-height-padded) + var(--tritab-grid-gap));
    
    /* these let us have differing numbers of columns depending on the screen width */
    /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
    --gap-count: calc(var(--tritab-max-cols) - 1);
    --total-gap-width: calc(var(--gap-count) * var(--tritab-grid-gap));
    --grid-item--max-width: calc((100% - var(--total-gap-width)) / var(--tritab-max-cols));
    
    /* now we begin setting css rules proper */
    font-size: var(--tritab-font-size);
    font-family: var(--tritab-font-family);
    color: var(--tritab-fg);
}

body {
    margin: 0;
    padding: 0;
}

#outermost {
    top: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 2147483646;
}

#gridalign {
    height: 100%;
    width: var(--tritab-total-width);
    margin: auto;
}

#dimmer {
    top: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    background: var(--tritab-dimmer-bg);
    opacity: var(--tritab-dimmer-opacity);
}

#tabs {
    /* no effect but gives access to px value of tab spacing in js through getComputedStyle(...).getPropertyValue("background-size") */
    background-size: var(--calc-row-spacing);
    display: grid;
    /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
    grid-template-columns: repeat(auto-fill, minmax(max(var(--tritab-col-min-width), var(--grid-item--max-width)), 1fr));
    grid-gap: var(--tritab-grid-gap);
    width: 100%;
    overflow: clip;
    margin: auto;
    margin-top: var(--tritab-tabs-top);
    height: calc(var(--calc-row-spacing) * round(down, calc(100% - var(--tritab-tabs-top) / var(--calc-row-spacing))));
}

#ctrls {
    position: absolute;
    top: 20px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: var(--tritab-grid-gap);
    text-align: center;
    position: relative;
}

.HintSpanSpacer.TridactylHint {
    float: left;
    position: relative !important;
    visibility: hidden;
}

.TridactylTab, .TridactylTabCtrl {
    line-height: var(--tritab-line-height);
    overflow: clip;
}

.TridactylTab {
    height: var(--calc-cell-height);
    padding: var(--tritab-padding-top) 1em var(--tritab-padding-bottom) var(--tritab-hintspan-padding);
}

.TridactylTab, .TridactylTab.TridactylHintElem {
    outline-offset: -1px;
    outline: solid 1px var(--tritab-outline-color) !important;
    background: var(--tritab-bg) !important;
}

.TridactylTab.TridactylHintActive {
    text-decoration: var(--tritab-active-decoration);
    color: var(--tritab-active-fg) !important;
    background: var(--tritab-active-bg) !important;
    outline-offset: -1px;
    outline: solid 1px var(--tritab-active-outline-color) !important;
}

.TridactylTab.TridactylHintActive>.text>.url {
    color: var(--tritab-url-active-fg) !important;
    background: var(--tritab-url-active-bg) !important;
}

.TridactylTabCtrl {
    height: var(--tritab-ctrls-height);
    padding: var(--tritab-padding-top) 1.5em var(--tritab-padding-bottom) 1.5em;
}

.TridactylTabCtrl, .TridactylTabCtrl.TridactylHintElem {
    color: var(--tritab-ctrl-fg) !important;
    background: var(--tritab-ctrl-bg) !important;
    outline: solid 1px var(--tritab-ctrl-outline-color) !important;
}

.TridactylTabCtrl.TridactylHintActive {
    color: var(--tritab-ctrl-active-fg) !important;
    background: var(--tritab-ctrl-active-bg) !important;
    outline: solid 1px var(--tritab-ctrl-active-outline-color) !important;
    decoration: var(--tritab-ctrl-active-decoration) !important;
}

.TridactylTab.fake {
    background: var(--tritab-faketab-bg) !important;
    outline-color: var(--tritab-faketab-outline) !important;
}

.icons, .info {
    float: left;
    padding-right: 1em;
    height: 100%;
}

.text {
    display:block;
    align-content: center;
    white-space: nowrap;
    overflow: clip;
    text-overflow: ellipsis;
}

p {
    display:inline;
}

.title {
    font-size: var(--tritab-title-font-size);
}

.url {
    font-size: var(--tritab-url-font-size);
    color: var(--tritab-url-fg);
    background: var(--tritab-url-bg);
    text-decoration: var(--tritab-url-decoration);
}

img, .container {
    width: var(--tritab-icon-size);
    display: inline-block;
}

.container {
    height: var(--tritab-icon-size);
    mask-size: contain;
    background-size: contain;
}

</style>

<style>
${customtheme}
</style>

</head>
<body>
<template id="tabTemplate">
	<div class="TridactylTab TridactylTabHint">
		<span class="TridactylHint HintSpanSpacer">ZZZ</span>
        <div class="info">
            <p class="wintabindex">000</p>
            <br>
            <p class="prefix">000</p>
        </div>
        <div class="icons">
            <div class="container"></div>
            <br>
            <img class="favicon">
        </div>
        <div class="text">
            <p class="title"></p>
            <br>
            <p class="url"></p>
        </div>
    </div>
</template>
<template id="fakeTabTemplate">
	<div class="TridactylTab TridactylTabHint fake" tabid="fake"></div>
</template>
<div id="dimmer"></div>
<div id="outermost">
	<div id="gridalign">
		<div id="ctrls">
			<div id="prev" class="TridactylTabCtrl TridactylTabHint"><--</div>
			<div id="next" class="TridactylTabCtrl TridactylTabHint">--></div>
			<div id="close" class="TridactylTabCtrl TridactylTabHint">X</div>
			<div id="newtab" class="TridactylTabCtrl TridactylTabHint">+</div>
			<div id="search" class="TridactylTabCtrl TridactylTabHint">search</div>
		</div>
		<div id="tabs"></div>
	</div>
</div>
</body>
</html>`
    ], {
        type: "text/html"
    });

    /* create the blob url through the cmdline iframe's window to get a "blob:moz-extension://..." URL */
    const blurl = cmdwin.URL.createObjectURL(blob);

    /* pretty sure this happens automatically anyway */
    addEventListener("unload", () => URL.revokeObjectURL(blurl));

    /* make the iframe, give it the blob src, have it fill the screen and ignore the mouse */
    h.iframe = cmddoc.createElement("iframe");
    h.iframe.src = blurl;
    h.iframe.style.position = "fixed";
    h.iframe.style.top = 0;
    h.iframe.style.left = 0;
    h.iframe.style.width = "100%";
    h.iframe.style.height = "100%";
    h.iframe.style["z-index"] = 2147483646;
    h.iframe.style.border = "none";
    h.iframe.scrolling = "no";
    h.iframe.style["pointer-events"] = "none";
    h.iframe.style.display = "none";

    document.documentElement.appendChild(h.iframe);

    /* can't put javascript in the iframe source so add everything once it's loaded */
    h.iframe.onload = () => {
        const w = h.iframe.contentWindow;
        const d = h.iframe.contentDocument;

        const tabGrid = {
            el: d.getElementById("tabs"),
            first: 0,
            rangeStyle: d.createElement("style"),
        };

        /* let tab grid be accessed through the iframe's content window (for testing mainly) */
        w.newTabGrid = tabGrid;

        /* rangeStyle sets which grid cells are visible */
        d.head.appendChild(tabGrid.rangeStyle);

        /* this is used with next() and prev() to change which tabs are shown */
        tabGrid.setRange = (from, to) => tabGrid.rangeStyle.textContent = `.TridactylTab:nth-child(-n+${from}), .TridactylTab:nth-child(n+${to+1}) { display:none; }`;

        tabGrid.next = () => {
            if (tabGrid.first + tabGrid.maxVisibleCells < tabGrid.el.children.length) {
                tabGrid.first = Math.min(tabGrid.el.children.length - 1, tabGrid.first + tabGrid.maxVisibleCells);
                tabGrid.setRange(tabGrid.first, tabGrid.first + tabGrid.maxCells);
            }
        };

        tabGrid.prev = () => {
            tabGrid.first = Math.max(0, tabGrid.first - tabGrid.maxVisibleCells);
            tabGrid.setRange(tabGrid.first, tabGrid.first + tabGrid.maxCells);
        };

        /* for the buttons above the tab grid */
        tabGrid.ctrlCallbacks = {
            prev: () => {
                tabGrid.prev();
                return h.hint();
            },
            next: () => {
                tabGrid.next();
                return h.hint();
            },
            close: () => {
                return tri.excmds.tabclose();
            },
            newtab: () => {
                h.hide();
                return tri.excmds.tabopen();
            },
            search: () => {
                h.hide();
                return tri.excmds.fillcmdline("taball");
            },
        };

        /* calculate how many tab cells can fit completely within the screen */
        tabGrid.calcMaxCells = (numTabs) => {
            const compStyle = getComputedStyle(tabGrid.el);

            let gridTop = tabGrid.el.getBoundingClientRect().top;
            /* px value thanks to that css workaround */
            let cellHeightPx = parseFloat(compStyle.backgroundSize);

            let maxRows = Math.max(1, Math.floor((innerHeight - gridTop) / cellHeightPx));
            let numCols = compStyle.gridTemplateColumns.split(" ").length;
            let maxTabs = compStyle.getPropertyValue("--tritab-max-tabs");

            tabGrid.maxVisibleCells = Math.min(numCols * maxRows, maxTabs);
            tabGrid.maxCells = Math.min(numTabs, maxTabs, tabGrid.maxVisibleCells);
        };

        /* create html elements from tab data */
        tabGrid.tabsToGrid = async (bTabAll = false) => {
            const thiswin = (await tri.browserBg.windows.getCurrent()).id;

            /* to get container info using cookieStoreIds as keys */
            let containers = (await tri.browserBg.contextualIdentities.query({})).reduce((acc, cur) => {
                acc[cur.cookieStoreId] = cur;
                return acc;
            }, {});

            let tabs = await tri.browserBg.tabs.query(bTabAll ? {} : {
                currentWindow: true
            });

            let frag = d.createDocumentFragment();

            /* for % and # prefixes, could probably neaten this up */
            let mostRecentAccessed = 0;
            let secondMost = 0;
            let currTab = 0;
            let prevTab = -1;

            let winnum = 0;
            let windexes = {};

            tabs.every((tab, i) => {
                let cell = d.getElementById("tabTemplate").content.cloneNode(true);

                if (!windexes[tab.windowId]) windexes[tab.windowId] = ++winnum;

                /* this was slightly more complex than I thought and is now ugly. */
                /* checking as we iterate for the two most recently used tabs */
                if (tab.windowId === thiswin) {
                    if (tab.lastAccessed > mostRecentAccessed) {
                        secondMost = mostRecentAccessed;
                        mostRecentAccessed = tab.lastAccessed;
                        prevTab = currTab;
                        currTab = i;
                    } else if (t.lastAccessed > secondMost) {
                        secondMost = tab.lastAccessed;
                        prevTab = i;
                    }
                }

                if (tab.favIconUrl !== undefined) cell.querySelector(".favicon").src = tab.favIconUrl;
                else cell.querySelector(".favicon").style.visibility = "hidden";

                /* prefixes same as :tab and :taball */
                let prefix = "";
                if (tab.pinned) prefix += "P";
                if (tab.audible) prefix += "A";
                if (tab.mutedInfo.muted) prefix += "M";
                if (tab.discarded) prefix += "D";

                cell.querySelector(".prefix").textContent = prefix;
                cell.querySelector(".title").textContent = tab.title;
                cell.querySelector(".url").textContent = tab.url;
                cell.querySelector(".wintabindex").textContent = (bTabAll ? windexes[tab.windowId] + "." : "") + (tab.index + 1);

                /* style according to tab containers */
                if (tab.incognito) {
                    cell.querySelector(".container").setAttribute("style", `background-image: url("chrome://global/skin/icons/indicator-private-browsing.svg")`);
                    cell.querySelector(".TridactylTab").setAttribute("style", "--tritab-outline-color: var(--tritab-incognito-outline-color);");

                } else if (tab.cookieStoreId !== "firefox-default") {
                    cell.querySelector(".container").setAttribute("style", `mask-image:url("${containers[tab.cookieStoreId].iconUrl}"); background-color: ${containers[tab.cookieStoreId].colorCode};`);

                    cell.querySelector(".TridactylTab").setAttribute("style", `--tritab-outline-color: ${containers[tab.cookieStoreId].colorCode};`);
                }

                /* tab.id set within the html elements so it's easily accessible when selected as a hint */
                cell.querySelector(".TridactylTab").setAttribute("tabid", tab.id);

                frag.appendChild(cell);

                return true;
            });

            /* after iterating through all tabs we can correctly add current/previous tab prefixes */
            frag.children[currTab].querySelector(".prefix").textContent = "%" + frag.children[currTab].querySelector(".prefix").textContent;
            if (prevTab > -1) {
                frag.children[prevTab].querySelector(".prefix").textContent = "#" + frag.children[prevTab].querySelector(".prefix").textContent;
            }


            tabGrid.calcMaxCells(tabs.length);
            tabGrid.setRange(0, tabGrid.maxVisibleCells);

            /* fill empty spaces with fake tabs so the keys for selecting tabs don't change after pressing next/prev  */
            if (tabs.length > tabGrid.maxVisibleCells) {
                for (let i = 0; i < tabGrid.maxVisibleCells - tabs.length % tabGrid.maxVisibleCells; ++i) {
                    frag.appendChild(d.getElementById("fakeTabTemplate").content.cloneNode(true));
                }
            }

            tabGrid.el.replaceChildren(frag);

        };

        h.hide = () => {
            h.iframe.style.display = "none";
            tabGrid.el.replaceChildren();
        };

        h.hint = async () => {
            /* ctrls concatenated so that the tab elements get the choicest keys for hinting */
            tri.hinting_content.hintElements(Array.from(tabGrid.el.children).concat(Array.from(d.getElementById("ctrls").children)), {
                callback: (t) => {
                    /* nothing selected, ie hit <Esc> */
                    if (!t) {
                        h.hide();
                        return;
                    }
                    const id = t.getAttribute("tabid");

                    if (id) {
                        /* keep everything the same and hint again if selecting a fake tab */
                        /* maybe fake tabs' z-index could be higher than hint spans so you don't even see them? */
                        if (id === "fake") {
                            return h.hint();
                        } else {
                            h.hide();
                            return tri.webext.goToTab(Number(id));
                        }
                    } else {
                        return tabGrid.ctrlCallbacks[t.id]();
                    }
                }
            });
        };

        h.showAndHint = async (bAllTabs = false) => {
            h.iframe.style.display = "revert";
            await tabGrid.tabsToGrid(bAllTabs);
            h.hint();
        };

        h.showAndHint(JS_ARGS[1] === "-a");
    };
};
Ω
