const grid = document.querySelector("#tri-tabs-grid");

addEventListener("message", (event) => {
	// populate grid with tabs from message
	if (event.data[0] === "update") {
		grid.textContent = "";

		// just doing 5 because it's only a test after all
		let count = 5;
		event.data[1].every(function(tab) {
			let cell = document.createElement("div");
			cell.className = "tri-tabs-cell";

			let iconsDiv = document.createElement("div");
			let incogicon = document.createElement("img");
			let favicon = document.createElement("img");

			incogicon.src = "chrome://global/skin/icons/indicator-private-browsing.svg";
			favicon.src = tab.favIconUrl;

			incogicon.style.opacity = (tab.favIconUrl === undefined ? 0 : 1);
			incogicon.style.opacity = (tab.incognito ? 1 : 0);

			iconsDiv.className = "tri-tab-icons";
			incogicon.className = "tri-tab-incogicon";
			favicon.className = "tri-tab-favicon";
			
			iconsDiv.appendChild(incogicon);
			iconsDiv.appendChild(favicon);
			cell.appendChild(iconsDiv);

			let textDiv = document.createElement("div");
			textDiv.className = "tri-tab-text";
			let title = document.createElement("p");
			let url = document.createElement("p");
			title.className = "tri-tab-title";
			url.className = "tri-tab-url";

			title.innerText = tab.title;
			url.innerText = tab.url;
			textDiv.appendChild(title);
			textDiv.appendChild(url);
			cell.appendChild(textDiv);

			cell.tabid = tab.id;

			grid.appendChild(cell);

			return --count > 0;
		});

		// send tab ids and element locations back to window
		let messageBack = [];
		
		for (let i = 0; i < grid.childElementCount; ++i){
			let rect = grid.children[i].getBoundingClientRect();
			messageBack.push(rect.left);
			messageBack.push(rect.top);
			messageBack.push(grid.children[i].tabid);
		}
		
 		event.source.postMessage(messageBack, "*");
	}
});
