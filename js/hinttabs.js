/* create elements once (per tridactyl load) then show / hide */
/* ended up more complex and not sure if it's any better than the last one */
/* #tri-tab-grid-parent outline can be set to like 2000px to cover the whole screen */
if (tri.hinttabspopup === undefined) {
    /* some properties to change the layout of the grid */
    tri.hinttabspopup = {};
    const ht = tri.hinttabspopup;
    ht.maxCols = 3;
    ht.maxRows = 10;

    ht.widthPercentage = 75;
    ht.topOffset = 7; /* rem - dist from top of window */
    ht.minCellWidth = 50; /* px - fewer columns if window isn't wide enough */
    ht.bTabIdInTitle = false; /* display window and tab id in titles (can't hint the numbers so not that useful) */
    ht.gridGap = 5; /* px */
    ht.bFavicons = true;
    ht.iconSize = 1; /* em - moves text vertically if not 1em */

    /* these are some selectors for elements created for the tab grid - could be added to custom tridactyl theme */

  ht.styleRulesString = "#tri-tab-grid-parent { background: rgba(30,30,30,0.25) !important; outline: solid rgba(30,30,30,0.25)  5px; filter: drop-shadow(0 0 10rem #3a0080); }" +
        "#tri-tab-grid { height: fit-content; font-family: var(--tridactyl-cmdl-font-family); color: var(--tridactyl-cmdl-fg); font-size: var(--tridactyl-cmdl-font-size); filter: drop-shadow(0 0 0.2rem grey); }" +

        "#tri-tab-grid>div { padding: 0.5em; overflow: clip; text-overflow: ellipsis; white-space: nowrap; text-align: left; background-color: #101216 !important; padding-left: 1.5em; padding-right: 1.5em; } " +

        "#tri-tab-grid>div>p { display: inline; } " +

        "#tri-tab-grid>div>p.tri-tab-title { color: #e4e4e4 !important; }" +

        "#tri-tab-grid>div>p.tri-tab-url { color: slateblue !important; } " +

        "#tri-tab-grid>div>p>img { padding: 0 1em 0 0; display: inline-block; vertical-align: middle; height:" + ht.iconSize + "em; }" +

        "#tri-tab-grid>div.TridactylHintActive { background-color: #202020 !important; } " +

        "#tri-tab-grid>div.TridactylHintActive>p {  } " +

        "#tri-tab-grid>div.TridactylHintActive>p.tri-tab-title { color: white !important; }" +

        "#tri-tab-grid>div.TridactylHintActive>p.tri-tab-url { color: yellow !important; } " +

        "#tri-tab-grid>div>p>img {  }" +

        ".tri-tab-grid-more { margin-left:" + ht.gridGap + "px; margin-right:" + ht.gridGap + "px; height:100%; background-color: #101216 !important; display: flex; align-items: center; justify-content: center; color: #e4e4e4 !important; } ";

    /* I don't know where this lives in tridactyl but it's there somewhere */
    /* just need the tab number for this */
    ht.goToTab = async function(tabId) {
        const tab = await tri.browserBg.tabs.update(tabId, { active: true });
        await tri.browserBg.windows.update(tab.windowId, { focused: true });
        return tab;
    };

    ht.fillCells = function(tabs, grid, lastcell) {
        lastcell = Math.min(lastcell, tabs.length);

        for (let i = 0; i < lastcell; ++i) {
            ht.fillCell(tabs[i], grid.children[i]);
            grid.children[i].style.display = "";
        }

        for (let i = lastcell; i < grid.childElementCount; ++i) {
            grid.children[i].style.display = "none";
        }

        return lastcell;
    };

    ht.fillCell = function(tab, cell) {
        let title = cell.querySelector(".tri-tab-title");
        let url = cell.querySelector(".tri-tab-url");

        title.innerHTML = "";
        url.innerHTML = "";

        /* favicons and private browsing icons */
        if (ht.bFavicons) {
            let incogicon = document.createElement("img");
            incogicon.src = "chrome://global/skin/icons/indicator-private-browsing.svg";
            if (!tab.incognito) {
                incogicon.style.visibility = "hidden";
            }
            title.appendChild(incogicon);
                
            let favicon = document.createElement("img");
            
            if (tab.favIconUrl === undefined) {
                favicon.style.visibility = "hidden";
            }
            else {
                favicon.src = tab.favIconUrl;
            }
            
            url.appendChild(favicon);
        }

        cell.tabid = tab.id;

        title.insertAdjacentText("beforeEnd", tab.title);
        url.insertAdjacentText("beforeEnd", tab.url);

        return cell;
    };


    ht.maxCellsToFitInScreen = function(grid, cols) {
        let cell = grid.children[0];
        let rect = cell.getBoundingClientRect();
        let cellheight = rect.height + ht.gridGap;
        let maxrows = Math.max(1, Math.floor((window.innerHeight - rect.top) / cellheight));

        return cols * maxrows;
    };

    ht.addCell = function(grid) {
        let cell = document.createElement("div");
        cell.className = "tri-tab-hint";
        grid.appendChild(cell);

        let title = document.createElement("p");
        let url = document.createElement("p");
        title.className = "tri-tab-title";
        url.className = "tri-tab-url";

        /* want to get some height measured... maybe it should just be set... */
        title.innerText = "|"; 
        url.innerText = "|";

        cell.appendChild(title);
        cell.appendChild(document.createElement("br"));
        cell.appendChild(url);

        let rect = cell.getBoundingClientRect();

        return cell;
    };
    
    ht.addCells = function(grid, cols) {
        if (grid.childElementCount === 0) {
            ht.addcell(grid);
        }
        let lastcell = ht.maxCellsToFitInScreen(grid, cols);

        for (let i = grid.childElementCount; i < lastcell; ++i) {
            ht.addCell(grid);
        }

        return lastcell;
    };

    ht.makeTabGrid = function(cols) {
        if (ht.tabgridelem === undefined) {
            ht.tabgridelem = document.createElement("div");
            ht.tabgridelem.setAttribute("style", "grid-template-columns: repeat("+cols+", minmax(0, 1fr));");
            ht.tabgridelem.style.display = "grid";
            ht.tabgridelem.style["grid-gap"] = ht.gridGap + "px";
            ht.tabgridelem.id = "tri-tab-grid";
            ht.tabgridelem.numcols = cols; /* just store this info in there why not */
            ht.addCell(ht.tabgridelem); /* make one so we can see how big they'll be */
            ht.tabgridparent.appendChild(ht.tabgridelem);
        }
        else {
            ht.tabgridelem.style["grid-template-columns"] = "repeat("+cols+", minmax(0px, 1fr))";
            ht.tabgridelem.numcols = cols;
        }

        return ht.tabgridelem;
    };

    ht.addPrevTabs = function(parentElem) {
        if (ht.prevtabs === undefined) {
            let prevTabsParent = document.createElement("div"); /* does this need to be here? */
            let prevTabs = document.createElement("div");
            prevTabs.id = "tri-tabs-prev";
            prevTabs.className = "tri-tab-grid-more";
            prevTabs.innerText = "<--";
            prevTabsParent.appendChild(prevTabs);
            parentElem.appendChild(prevTabsParent);
            ht.prevtabs = prevTabs;
        }
    };

    ht.addNextTabs = function(parentElem) {
        if (ht.nexttabs === undefined) {
            let nextTabsParent = document.createElement("div");
            let nextTabs = document.createElement("div");
            nextTabs.id = "tri-tabs-next";
            nextTabs.className = "tri-tab-grid-more";
            nextTabs.innerText = "-->";
            nextTabsParent.appendChild(nextTabs);
            parentElem.appendChild(nextTabsParent);
            ht.nexttabs = nextTabs;
        }
    };

    ht.createOrShowGrid = async function(bTabAll, start = 0) {
        let alltabs = await tri.browserBg.tabs.query(bTabAll ? {} : {currentWindow:true});
        let tabs = alltabs.slice(start, start + (ht.maxRows * ht.maxCols));

        let layoutGrid = ht.createLayoutGrid();

        ht.addPrevTabs(layoutGrid);

        let columns = ht.maxCols;

        if (window.innerWidth * ht.widthPercentage * 0.01 / columns < ht.minCellWidth) {
            columns = Math.max(1, Math.floor(window.innerWidth / ht.minCellWidth));
        }

        let tabGrid = ht.makeTabGrid(columns);
        let maxCells = ht.addCells(tabGrid, columns);
        let numHintables = ht.fillCells(tabs, tabGrid, maxCells);

        ht.addNextTabs(layoutGrid);

        if (start + numHintables < alltabs.length) {
            ht.nexttabs.style.display = "";
            ht.nexttabs.onclick = () => ht.hint(bTabAll, start + numHintables);
        }
        else {
            ht.nexttabs.style.display = "none";
        }

        if (start > 0) {
            ht.prevtabs.style.display = "";
            ht.prevtabs.onclick = () => ht.hint(bTabAll, Math.max(0, start - maxCells));
        }
        else {
            ht.prevtabs.style.display = "none";
        }

        return layoutGrid;
    };

    ht.createLayoutGrid = function() {
        if (ht.tabgridparent === undefined) {
            ht.tabgridparent = document.createElement("div");
            ht.tabgridparent.id = "tri-tab-grid-parent";
            ht.tabgridparent.style.position = "fixed";
            ht.tabgridparent.style.top = ht.topOffset + "rem";
            ht.tabgridparent.style.width = "100%";
            ht.tabgridparent.style.height = "fit-content";
            ht.tabgridparent.style["z-index"] = 2147483645;

            ht.tabgridparent.style["grid-template-columns"] = ((100 - ht.widthPercentage) / 2) + "fr " + ht.widthPercentage + "fr " + ((100 - ht.widthPercentage) / 2) + "fr";

            /* using shadow dom seems break it, at least on some sites (eg github), oh well */
          	
            let shadowHost = document.createElement("div");
            const shadow = shadowHost.attachShadow({ mode: "open" });
            /* shadow.adoptedStyleSheets = [ht.makeShadowStylesheet()]; */
          
          	shadow.innerHTML = "<style>"+ ht.styleRulesString +"</style>";
          
            shadow.appendChild(ht.tabgridparent);
            document.documentElement.appendChild(shadowHost);
          

            /* document.adoptedStyleSheets = [ht.makeShadowStylesheet()]; 
            document.documentElement.appendChild(ht.tabgridparent); */
        }

        ht.tabgridparent.style.display = "grid";
        return ht.tabgridparent;
    };

    /* make a grid of tabs and hint them */
    ht.hint = async function(bTabAll = false, start = 0) {
        let grid = await ht.createOrShowGrid(bTabAll, start);
        return tri.excmds.hint("-c", "#tri-tab-grid>div,.tri-tab-grid-more").then(function(r) {
            if (r.tabid !== undefined) {
                ht.goToTab(r.tabid);
                grid.style.display = "none";
            }
            else if (r.className === "tri-tab-grid-more") {
                /* handled in onclicks currently */
            }
            else {
                /* hide instead of removing */
                grid.style.display = "none";
            }
            return r;
        });
    };
}

tri.hinttabspopup.hint(!0);
