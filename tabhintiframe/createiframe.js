let iframe = document.createElement("iframe");

iframe.src = "tabgrid.html";

iframe.id = "tri-tabhint-iframe";
iframe.sandbox = "allow-same-origin allow-scripts";
iframe.style.width = "100%";
iframe.style.height = "100%";
iframe.style.position = "relative";
iframe.style.margin = 0;iframe.style.border = "none";document.body.parentElement.appendChild(iframe);

let hintparent = document.createElement("div");

document.body.parentElement.appendChild(hintparent);

window.addEventListener("message", (event) => { hintparent.innerText = "";
	let iframeRect = iframe.getBoundingClientRect();
	for(let i = 0; i < event.data.length; i+=3) {
		let hintable = document.createElement("div");
		hintable.style.position = "absolute";
		hintable.style.left = (event.data[i] + iframeRect.left) +"px";
		hintable.style.top = (event.data[i + 1] + iframeRect.top) + "px";
		hintable.style.width = "1em";
		hintable.style.height = "1em";
		hintable.className = "tri-tab-hint";
		hintable.setAttribute("tabid", event.data[i+2]);
		hintparent.appendChild(hintable);
	}
});