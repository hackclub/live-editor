const trigger = e => e.composedPath()[0];
const matchesTrigger = (e, selectorString) => trigger(e).matches(selectorString);
// create on listener
export const createListener = (target) => (eventName, selectorString, event) => { // focus doesn't work with this, focus doesn't bubble, need focusin
	target.addEventListener(eventName, (e) => {
		e.trigger = trigger(e); // Do I need this? e.target seems to work in many (all?) cases
		if (selectorString === "" || matchesTrigger(e, selectorString)) event(e);
	})
}

function pauseEvent(e) {
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

function upload(files, extensions = []) {
  let file = files[0];
  let fileName = file.name.split(".");
  let name = fileName[0];
  const extension = fileName[fileName.length - 1];

  if (extensions.length > 0 && extensions.includes(enxtension)) throw "Extension not recongized: " + fileName;

  readFile(file);
  // if (["json"].includes(extension)) readFile(file);
  // else console.log("Unknown extension:", extension);
};

function readFile(file) {
  var reader = new FileReader();
  reader.readAsText(file);

  reader.onloadend = event => {
    let text = reader.result;

    console.log(text);
  };
}

function addDropUpload(state, bodyListener) {
	bodyListener("drop", "", function(evt) {    
		let dt = evt.dataTransfer;
		let files = dt.files;

		upload(files);

		pauseEvent(evt);
	});

	bodyListener("dragover", "", function(evt) {    
		pauseEvent(evt);
	});
}

function addVerticalBarDrag(state, bodyListener) {
	let moveVerticalBar = false;

	bodyListener("mousedown", "#vertical-bar", e => {
		moveVerticalBar = true;
	})

	bodyListener("mousemove", "", (e) => {
		if (!moveVerticalBar) return;

		let x = e.clientX/window.innerWidth * 100;
		if (x === 0) return;

		const minX = 0;
		const maxX = 100;

		if (x < minX) x = minX;
		if (x > maxX) x = maxX;

		document.documentElement.style.setProperty("--vertical-bar", `${x}%`);

		pauseEvent(e);
	})

	bodyListener("mouseup", "", e => {
		moveVerticalBar = false;
	})

	bodyListener("mouseleave", "", e => {
		moveVerticalBar = false;
	})
}

const isDigit = (ch, left = false) => /[0-9]/i.test(ch) || ch === "." || (left && ch === "-");

function addNumberDragging(state, bodyListener) {
	let dragged = false;
	let num, pos_start, pos_end, sigFigs, usePrecision, selectedText;

	bodyListener("mousedown", ".ͼb", e => {
		const s = state.codemirror.view.state;
		const doc = s.doc;
		const pos = s.selection.main.head;
		const at = doc.lineAt(pos);

		let { from, to, text} = doc.lineAt(pos)
		let start = pos, end = pos;
		// console.log("start", start, text[start - from - 1], "end", end, text[end - from]);
		while (start > from && isDigit(text[start - from - 1], true)) start--
		while (end < to && isDigit(text[end - from])) end++


		selectedText = text.slice(start-from, end-from);

		num = Number(selectedText);
		dragged = true;
		pos_start = start;
		pos_end = end;
		usePrecision = selectedText.includes(".");
		sigFigs = selectedText.includes(".") ? selectedText.split(".")[1].length : 1;

		// document.body.classList.add("no-select");
	})

	bodyListener("mousemove", "", e => {
		if (dragged) {
			const sign = 0 > e.movementX ? 1 : -1;
			// console.log(sign, e.movementX);
			const oldValue = `${num}`;
			if (usePrecision) {
				let rounded = Math.round(num*10**sigFigs);
				let newNum = rounded + e.movementX;
				newNum = Math.round(newNum)/(10**sigFigs);

				num = newNum;		
			} else {
				num += e.movementX;
			}

			const newValue = `${num}`;

			state.codemirror.view.dispatch({
			  changes: {from: pos_start, to: pos_start + selectedText.length, insert: newValue}
			});

			selectedText = newValue;
			dispatch("RUN");
			pauseEvent(e);
		}
	})

	bodyListener("mouseup", "", e => {
		dragged = false;
		// document.body.classList.remove("no-select");
	})

	bodyListener("mouseleave", "", e => {
		dragged = false;
		// document.body.classList.remove("no-select");
	})
}

export function events(state) {
	const bodyListener = createListener(document.body);
	bodyListener("keydown", "", function(event) {
		let code = event.code;

		const prog = state.codemirror.view.state.doc.toString();
    window.localStorage.setItem("cm-prog", prog);
    
		// console.log(code, event);
		if (code === "Enter" && event.shiftKey) {
		  event.preventDefault();
		  dispatch("RUN");
		}
	});

	// bodyListener("mousedown", "", (e) => {
	// 	if (!e.target.matches(".examples > *, .examples")) {
 //        dispatch("EXAMPLES", { show: false });
 //    }
	// })

	addVerticalBarDrag(state, bodyListener);
	addNumberDragging(state, bodyListener);
	addDropUpload(state, bodyListener);
}
