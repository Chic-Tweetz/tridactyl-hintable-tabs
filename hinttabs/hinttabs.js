// iframe js source
// receive messages with tab info

const tabTemplate = document.querySelector("#tabtemplate");
const grid = document.querySelector("#tabs");
var customStyle = document.querySelector("#customstyle");
var tabs;
var activeHint;


// take icons, titles and urls to pop in divs
function makeCell(tab) {
	const cell = tabTemplate.content.cloneNode(true);
	if (tab.favIconUrl !== undefined) {
		cell.querySelector(".favicon").src = tab.favIconUrl;
	}
	else {
		cell.querySelector(".favicon").style.visibility = "hidden";
	}
	
	cell.querySelector(".title").textContent = tab.title;
	cell.querySelector(".url").textContent = tab.url;
	return cell;
}

// use the current tab list but start from a different index
function changeTabRange(start, count) {
	grid.numChildElements
	
	let frag = document.createDocumentFragment();
	
	for (let i = start; i < Math.min(tabs.length, start + count); ++i) {
		frag.appendChild(makeCell(tabs[i]));
	}
	
	grid.replaceChildren(...frag.children);
}

// replace tabs with new ones
function newTabArr(tabArr, count) {
	tabs = tabArr;
	
	let frag = document.createDocumentFragment();
	// let maxCount = maxCells() - 1;
	
	tabArr.every(function(tab, i) {
		frag.appendChild(makeCell(tabs[i]));
		return i < count - 1;
	});
	
	grid.replaceChildren(...frag.children);
	
	// seems to hint the first item automatically
	activeHint = grid.children[0];
	grid.children[0].classList.add("TridactylHintActive");

}

// add class to active hint to get style on it
function highlight(index) {
	activeHint?.classList.remove("TridactylHintActive");
	if (index >= 0 && index < grid.childElementCount) {
		grid.children[index].classList.add("TridactylHintActive");
		activeHint = grid.children[index];
	}
}

function changeStyling(style) {
	customStyle.textContent = style;
}

// atm receives arrays with 2 or 3
addEventListener("message", function(msg) {
	switch (msg.data[0]) {
		case "newtabs" : newTabArr(msg.data[1], msg.data[2]); break;
		case "range" : changeTabRange(msg.data[1], msg.data[2]); break;
		case "highlight" : highlight(msg.data[1]); break;
		case "style" : changeStyling(msg.data[1]); break;
		default : break;
	}
});

