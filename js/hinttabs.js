/* create list of tabs in a grid then hint them */
/* in shadow dom, so styling is all from ti.css declared near the top */
var bAllWindows = true;

if (tri.hinttabs !== undefined) {
    tri.hinttabs.showAndHint(bAllWindows);
} else {
    tri.hinttabs = {};
    const ti = tri.hinttabs;
    
    ti.css = `
        :root, #gridalign {

            font-size: 9pt;
    
            font-family: monospace;
            color: white;
        
            /* maximum columns & minimum column width - from:
            *  https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
            --grid-column-count: 4;
            --grid-item--min-width: 400px;
    
            /* these affect the placement of the grid items */
            --tri-tabs-title-font-size: 1em;
            --tri-tabs-url-font-size: 1em;

            --tri-tabs-line-height: 1.4em;
            --tri-tabs-grid-gap: 0.4em;

            --tri-tabs-padding-top: 0.5em;
            --tri-tabs-padding-bottom: 0.5em;
    
            --tri-tabs-icon-size: 1em;

            /* this is daft, yes? It does work though */
            --tri-tabs-tab-height:     calc( max( var(--tri-tabs-line-height), var(--tri-tabs-title-font-size), var(--tri-tabs-icon-size) ) + max( var(--tri-tabs-line-height), var(--tri-tabs-url-font-size), var(--tri-tabs-icon-size) ) );
            --tri-tabs-tab-padded:     calc(var(--tri-tabs-tab-height) + var(--tri-tabs-padding-top) + var(--tri-tabs-padding-bottom));
            --tri-tabs-tab-spacing: calc(var(--tri-tabs-tab-padded) + var(--tri-tabs-grid-gap));

            /**
            * Calculated values.
            * https://css-tricks.com/an-auto-filling-css-grid-with-max-columns
            */
            --gap-count: calc(var(--grid-column-count) - 1);
            --total-gap-width: calc(var(--gap-count) * var(--tri-tabs-grid-gap));
            --grid-item--max-width: calc((100% - var(--total-gap-width)) / var(--grid-column-count));
    
        }
    
        .icons {
            float:left;
            padding-right: 1em;
            padding-left: 1em;
            height: 100%;
        }

        .text {
            display:block;
            align-content: center;
            white-space: nowrap;
            overflow: clip; 
            text-overflow: ellipsis;
            color: rgb(240,240,240);
        }

        p {
            display:inline;
        }

        .title {
            font-size: var(--tri-tabs-title-font-size);
        }

        .url {
            font-size: var(--tri-tabs-url-font-size);
            color: slateblue;
        }

        img {
            width: var(--tri-tabs-icon-size);
            display:inline;
        }
    
        #dimmer {
            top: 0;
            position: fixed;
            width: 100%;
            height: 100%;
            background: rgba(31, 7, 47, 0.5);
        }

        #outermost {
            top: 1em;
            position: fixed;
            width: 100%;
            height: 100%;
        }

        #gridalign {
            width: 80%;
        /*     height: 100%; */
            margin: auto;
        }
    
        #tabs {
            /* no effect but easy access to px value of tab spacing in js */
            background-size: var(--tri-tabs-tab-spacing);
    
            display: grid;
    
            /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
            grid-template-columns: repeat(auto-fill, minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr));
            grid-gap: var(--tri-tabs-grid-gap);

            width: 100%;
            overflow: clip;
            margin: auto;
        }

        #ctrls {
            /* top: calc(3em - calc( var(--tri-tabs-tab-height) / 2 ) - var(--tri-tabs-grid-gap)); */
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(5em, 1fr));
            grid-gap: var(--tri-tabs-grid-gap);
            /* position: fixed; */
            width: 100%;
            padding-bottom: var(--tri-tabs-grid-gap);
            text-align: center;
        }

        .tab, .ctrl {
            outline: solid 1px slateblue;
            outline-offset: -1px;
            background: rgb(16, 18, 22);
   
            line-height: var(--tri-tabs-line-height);
            overflow: clip;
        }

        .tab {
            height: var(--tri-tabs-tab-height); 
            padding: var(--tri-tabs-padding-top) 1em var(--tri-tabs-padding-bottom) 0.5em;
        }

        .ctrl {
            height: calc( var(--tri-tabs-tab-height) / 2 );
            padding: var(--tri-tabs-padding-top) 1.5em var(--tri-tabs-padding-bottom) 1.5em;
        }

        /* change styling for active hints */
        .TridactylHintActive {
            background: rgb(32, 36, 44);
        }

        .TridactylHintActive>.text>.title, .TridactylHintActive {
            color: white;
        }

        .TridactylHintActive>.text>.url {
            color: yellow;
        }`;

    /* index of first tab to list */
    ti.firstTab = 0;

    /* control divs all need almost the same declaration */
    function makeElem(tag, className="", id="", textContent="") {
        let elem = document.createElement(tag);
        if (className != "") { elem.className = className; }
        if (id !== "") { elem.id = id; }
        elem.textContent = textContent;
        return elem;
    };

    /* left / right buttons to see more tabs + whatever else you'd like to map to tridactyl functions */
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
    
    function tabTemplate() {
    
        /* html layout for tab info:
        <div class="tab">
            <div class="icons">
                <img class="incogicon" src="chrome://global/skin/icons/indicator-private-browsing.svg">
                <br>
                <img class="favicon">
            </div>
            <div class="text">
                <p class="title"></p>
                <br>
                <p class="url"></p>
            </div>
        </div>
        */
    
        let template = document.createElement("template");
        template.id = "tabtemplate";
        
        let tabDiv = document.createElement("div");
        tabDiv.className = "tab TridactylTabHint";
        
        let iconsDiv = document.createElement("div");
        iconsDiv.className = "icons";
        
        let incogicon = document.createElement("img");
        incogicon.src = "chrome://global/skin/icons/indicator-private-browsing.svg";
        incogicon.className = "incogicon";
        
        let favicon = document.createElement("img");
        favicon.className = "favicon";
        
        let textDiv = document.createElement("div");
        textDiv.className = "text";
        
        let titleText = document.createElement("p");
        titleText.className = "title";
        
        let urlText = document.createElement("p");
        urlText.className = "url";
        
        iconsDiv.appendChild(incogicon);
        iconsDiv.appendChild(document.createElement("br"));
        iconsDiv.appendChild(favicon);
        
        textDiv.appendChild(titleText);
        textDiv.appendChild(document.createElement("br"));
        textDiv.appendChild(urlText);
        
        tabDiv.appendChild(iconsDiv);
        tabDiv.appendChild(textDiv);
        
        template.content.appendChild(tabDiv);
        
        return template;
    };
    
    ti.faketab = {
        id: "fake",
        url: "",
        title: "",
        favIconUrl: "",
        incognito: false
    };
    
    /* maximum fully visible cells that could fit on screen */
    ti.maxCells = function(numTabs) {
        const computedStyle = getComputedStyle(ti.hintGrid);

        let top = ti.hintGrid.getBoundingClientRect().top;
        
        /* backgroundSize style rule exists for this line */
        let cellHeightPx = parseFloat(computedStyle.backgroundSize);
        let maxRows = Math.max(1, Math.floor((innerHeight - top) / cellHeightPx));
        let numCols = computedStyle.gridTemplateColumns.split(" ").length;

        ti.maxVisibleCells = numCols * maxRows;

        let maxCells = Math.min(numTabs, numCols * maxRows);
        let numRows = Math.ceil(maxCells / numCols);

        ti.hintCount = maxCells;

        return maxCells;
    };

    /* big old block of loading divs up (used to be split up but became a big blob while fixing stuff) */
    async function loadElements(bTabAll = true) {
        ti.tabs = await tri.browserBg.tabs.query(bTabAll ? {} : {currentWindow:true});

        /* create dom elements */
        let frag = document.createDocumentFragment();

        ti.shadowHost = document.createElement("div");
        ti.shadowHost.id = "TridactylHintTabs";

        let shadow = ti.shadowHost.attachShadow({ mode: "open" });
        let shadowStyle = document.createElement("style");
        shadowStyle.textContent = ti.css;

        shadow.appendChild(shadowStyle);
        
        ti.tabTemplate = tabTemplate();
        shadow.appendChild(ti.tabTemplate);

        /* cover screen completely with this one */
        let dimmer = document.createElement("div");
        dimmer.id = "dimmer";
        dimmer.style["z-index"] = 2147483645;
        shadow.appendChild(dimmer);

        /* make hint grid divs */
        let gridOuter = document.createElement("div");
        gridOuter.id = "outermost";
        gridOuter.style.zIndex = 2147483646;

        let gridAlign = document.createElement("div");
        gridAlign.id = "gridalign";

        ti.hintGrid = document.createElement("div");
        ti.hintGrid.id = "tabs";

        gridAlign.appendChild(makeControls());
        
        gridOuter.appendChild(gridAlign);
        gridAlign.appendChild(ti.hintGrid);

        shadow.appendChild(gridOuter);

        frag.appendChild(ti.shadowHost);

        document.documentElement.appendChild(frag);

    };
    
    /* take icons, titles and urls to pop in divs */
    function tabInfoIntoCell(cell, tab) {        
        let favicon = cell.querySelector(".favicon");

        if (tab.favIconUrl !== undefined) {
            favicon.src = tab.favIconUrl;
            favicon.style.visibility = "inherit";
        }
        else {
            favicon.style.visibility = "hidden";
        }
        
        cell.tabid = tab.id;
        
        cell.querySelector(".incogicon").style.visibility = (tab.incognito ? "inherit" : "hidden");
        cell.querySelector(".title").textContent = tab.title;
        cell.querySelector(".url").textContent = tab.url;
        
        return cell;
    }

    /* hintable elements with tab IDs as an attribute */
    ti.makeHints = async function() {
        let frag = document.createDocumentFragment();

        for (let i = 0; i < ti.hintCount; ++i) {
            frag.appendChild(ti.tabTemplate.content.cloneNode(true));
            
            const hint = frag.lastChild;
            
            console.log(hint);
            
            tabInfoIntoCell(hint, ti.tabs[i+ti.firstTab]);
            hint.index = i;
            
        }

        ti.hintGrid.replaceChildren(...frag.children);
    };

    /* update list of tabs to be current */
    ti.refreshTabList = async function(bTabAll) {
        ti.tabs = await tri.browserBg.tabs.query((bTabAll ? {} : {currentWindow:true}));
        ti.firstTab = 0;
        ti.hintCount = ti.maxCells(ti.tabs.length);
        ti.makeHints();
    };
    
    /* copied from tridactyl - open tab by its id */
    ti.gototab = async function (tabId) {
        const tab = await tri.browserBg.tabs.update(tabId, { active: true });
        await tri.browserBg.windows.update(tab.windowId, { focused: true });
        return tab;
    };

    /* change the start index of the tab list to get tab IDs for the hints */
    ti.updateHints = function() {
        for (let i = 0; i < ti.hintCount; ++i) {
            tabInfoIntoCell(ti.hintGrid.children[i], ti.tabs[i+ti.firstTab]);
        }

        /* keep the same key presses by keeping excess hint elems in the grid */
        for (let i = ti.hintCount; i < ti.hintGrid.childElementCount; ++i) {
            tabInfoIntoCell(ti.hintGrid.children[i], ti.faketab);
        }
    };

    ti.nextTabs = function() {
        let newstart = ti.firstTab + ti.hintGrid.childElementCount;

        if (newstart < ti.tabs.length) {
            ti.firstTab = newstart;
            ti.hintCount = Math.min(ti.tabs.length - newstart, ti.hintGrid.childElementCount);
            ti.updateHints();
        }

        ti.hint();
    };

    ti.prevTabs = function() {
        let newstart = ti.firstTab - ti.maxVisibleCells;

        if (newstart >= 0) {
            ti.firstTab = newstart;
            ti.hintCount = Math.min(ti.tabs.length - newstart, ti.maxVisibleCells);
            ti.updateHints();
        }

        ti.hint();
    };

    ti.showAndHint = async function(bTabAll = true) {
        ti.shadowHost.style.visibility = "visible";
        await ti.refreshTabList(bTabAll);
        ti.makeHints().then((h)=>{ti.hint();});
    };
    
    ti.hide = function() {
        ti.shadowHost.style.visibility = "hidden";
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
    
    /* create elements and then hint on first use */
    loadElements(bAllWindows).then(function(){
        ti.maxCells(ti.tabs.length);
        ti.makeHints().then(()=>{ti.hint()});
    });   
}
