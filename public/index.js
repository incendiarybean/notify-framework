import {$,$$, drag} from './framework';
let config;
try {
	config = require('../../../../notify.json');
} catch {
	config = require('../config/config.json');
}

const notify = (data, type, state) => {
	const promise = new Promise((resolve, reject) => {
		let style;
		let containerStyle
		let text_colour;
		let position;
		let slideDir;
		let noteTime;
		let noteTimer = 3000;

		if(!data.colour){
			data.colour = "red";
			text_colour = "red-500";
		} else {
			text_colour = "black"
		}
		if(!data.options || type === "min") data.options = [];

		if(data.position && type === "min"){
			position = '';
			for(let pos in data.position){
				position += ` ${data.position[pos]}-0`
			}
			if(data.position.includes('Bottom')){
				position += ` mb-5`;
			}
			if(data.position.includes('Top')) {
				position += ` mt-5`;
			}
			if(data.position.includes('Left')) {
				slideDir = 'Left';
			} 
			if(data.position.includes('Right')) {
				slideDir = 'Right';
			} 
			if (!data.position.includes('Top') && !data.position.includes('Bottom')){
				position += ` Bottom-0 mb-5`;
			} 
			if (!data.position.includes('Left') && !data.position.includes('Right')){
				position += ` Left-0`;
				slideDir = `Left`;
			}
			if(data.time){
				noteTimer = data.time;
			}
		} else {
			data.position = [];
		}

		if(type === "min"){
			style = "pop-min"; 
			containerStyle = `popup-cont animate__animated animate__slideIn${slideDir} animate__fast shadow-lg flex z-50 flex-col absolute ${position} w-64 mx-auto border-t-4 border-${data.colour}-500 items-center bg-white rounded-b text-${text_colour} text-md px-4 py-3`;
		} else if(type === "max") {
			style = `pop-max animate__animated animate__bounceIn items-center flex flex-col max-w-sm mx-auto text-${data.colour}-500 text-center text-md bg-white rounded shadow`; 
			containerStyle = "popup-cont-x animate__animated animate__faster fixed w-full h-full items-center top-0 z-50 bg-gray-500 bg-opacity-50 flex content-center";
		}

		let notification = document.createElement('div');
		notification.setAttribute("class", containerStyle);
		notification.setAttribute("role", "alert");
		notification.id = "popup";
		let nTemplate = notificationTemplate(data, style, data.colour, type);
			
		notification.innerHTML = nTemplate;
	
		if (data.additional) {
			console.log("Add a new handler for additional content!");
		}
	
		if (data.options && data.options.length > 0) {
			let opts = data.options;
			let button_container = document.createElement('div');
			for (let option in opts) {
				let slct = opts[option];
				let btn = document.createElement('button');
				btn.innerHTML = slct;
				button_container.append(btn);
				
				setPopFunction(btn, slct, resolve, reject);
			}
			if(type === "min"){
				button_container.setAttribute("class", "btn-cont animate__animated p-2 w-full flex justify-around");
			} else if(type === "max") {
				button_container.setAttribute("class", "btn-cont animate__animated p-4 w-full flex justify-around");
			}	
			notification.children[0].append(button_container);
		} else if (type !== "max") {
			noteTime = setTimeout(() => {
				if($('.popup-cont')){
					$$('.popup-cont').slideOut(slideDir);		
				}
			}, noteTimer);
		}
		document.body.append(notification);
		drag(notification.firstChild);
		if($('#Dismiss')) $('#Dismiss').addEventListener("click", () => {
			$$('.popup-cont-x').fadeOut();
		})
		if (data.options && data.options.length > 0 && notification.querySelectorAll('input')[0]) notification.querySelectorAll('input')[0].focus();
	}).catch((reject)=>{
		console.log(reject);
	}); 
	return promise; 
}

const notificationTemplate = (data, style, colour, type) => {
    let content, isLoading;
    if(data.body === "") {
        isLoading = 'block';
    } else {
        isLoading = 'hidden';
    }
    if(type === "max"){
        content = `<div class="leading-loose w-1/4 ${style}">
        <div draggable="true" class="cursor-grab active:cursor-grabbing w-full flex justify-end bg-${colour}-500 p-1 rounded-t"><svg id="Dismiss" height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#2a2e3b" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)" class="Dismiss cursor-pointer hover:fill-current text-red-300"><circle cx="8.5" cy="8.5" r="8"></circle><g transform="matrix(0 1 -1 0 17 0)"><path d="m5.5 11.5 6-6"></path><path d="m5.5 5.5 6 6"></path></g></g></svg></div>
        <p id="pop-title" class="mt-2 font-bold w-11/12 text-left border-b">${data.title}</p>
        <div id="loading" class="${isLoading} animate__animated py-4">
            <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
        <p id="pop-body" class="animate__animated animate__fast loading p-2 w-11/12 text-left text-black text-semi-bold">${data.body}</p>
        </div>`;
    } else {
        content = `<div class="w-full ${style}">
        <p class="mt-2 font-bold w-11/12 text-left border-b">${data.title}</p>
        <p class="py-2 w-11/12 text-left text-black text-semi-bold">${data.body}</p>
        </div>`;
    }
    
    return content;
}

const setPopFunction = (btn, query, resolve, reject) => {
	for(let actions in config.actions) {
		let item_conf = config.actions[actions];
		for(let options in item_conf.options) {
			options = item_conf.options[options];
			if(query.toString() === options.toString()) {
				btn.setAttribute("class", `${query} w-24 focus:outline-none text-${item_conf.colour}-400 border-${item_conf.colour}-400 rounded-full border hover:bg-${item_conf.colour}-400 hover:text-${item_conf.colour}-100 px-2`);
				return btn.addEventListener("click", () =>{
					if(item_conf.close) $$('.popup-cont-x').fadeOut();
					if(item_conf.reload) window.location.reload(false);
					if(item_conf.resolve) resolve(item_conf.returnComment);
					if(!item_conf.resolve) reject(item_conf.returnComment);					
				});
			}
		}
	}
}

export default notify;