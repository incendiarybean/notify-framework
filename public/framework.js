// WRITTEN BY BENJAMIN WEARE 2020 //

///////////////////////////
// SHORTHAND GET ELEMENT //
///////////////////////////

export const $ = (query) => {
    let _element = document.querySelectorAll(query)[0];
    return _element;
}

////////////////////////
// SHORTHAND GET/POST //
////////////////////////

$.get = function (url){
    const promise = new Promise(async (resolve, reject) => {
        const fetchReq = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default'
        };
        await fetch(url, fetchReq)
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(err => {
                console.log(`There was an error: ${err}`);
            })
    }).catch((reject) => {
        console.log(reject)
    });
    return promise;
}
$.post = (url, params) => {
    const promise = new Promise(async (resolve, reject) => {
        const fetchReq = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(params)
        };
        fetch(url, fetchReq)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => {
            console.log(`There was an error: ${err}`);
        })
    }).catch((reject) => {
        console.log(reject)
    });
    return promise;
}

/////////////////////////
// SHORTHAND FUNCTIONS //
/////////////////////////

export const $$ = (query) => {
    let el;
    class selector {
    
        constructor(query){
            this._element = document.querySelectorAll(query)[0];
            return this;
        }

        //////////////////////////////
        // CREATE CONTAINER ACTIONS //
        //////////////////////////////

        empty(){
            while(this._element.firstChild) this._element.removeChild(this._element.firstChild);
            return this;     
        }
        remove(){
            this._element.parentNode.removeChild(this._element);
            return this;
        }
        fadeIn(){
            this._element.classList.toggle("hidden", false);
            this._element.classList.add("animate__fadeIn");
            return this;
        }
        bounceOut(){
            this._element.classList.add("animate__bounceOut");
			this._element.addEventListener("animationend", () => {
				this._element.parentNode.removeChild(this._element);
                return this;
			});	 
        }
        slideOut(slideDir){
            if(!slideDir) slideDir = 'Left';
            this._element.classList.add(`animate__slideOut${slideDir}`);
			this._element.addEventListener("animationend", () => {
				this._element.parentNode.removeChild(this._element);
                return this;
			});	 
        }
        fadeOut(){
            this._element.classList.add("animate__fadeOut");
			this._element.addEventListener("animationend", () => {
				this._element.parentNode.removeChild(this._element);
                return this;
			});	
        }
        children(child){
            if(!child){
                this._element = this._element.children;
                return this;
            } else {
                this._element = this._element.children[child];
                return this;
            }
        }
        show(){
            this._element.style.display = "block";
            return this;
        }
        hide(){
            this._element.classList.add("animate__fadeOut");
            this._element.addEventListener("animationend", () => {
				this._element.classList.toggle("hidden", true);
                return this;
			});	
        }
        on(event, callback, capture){
            return this._element.addEventListener(event, callback, capture);
        }
    }

    el = new selector(query);
    return el;
}

///////////////////////////
// ENABLING DRAGGABLE UI //
///////////////////////////

export const drag = (el) => {
    let child;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let position;

    const startDrag = (e) => {
        var event = new Event('dragstart');
        child.dispatchEvent(event);  
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        if(!el.classList.contains('absolute')){
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            el.style.top = (el.offsetTop - pos2) + "px";
            el.style.left = (el.offsetLeft - pos1) + "px";
            el.classList.add('absolute');
        }
        document.onmouseup = endDrag;
        document.onmousemove = dragging;
    }

    const dragging = (e) => {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    const endDrag = () => {
        var event = new Event('dragend');
        el.dispatchEvent(event); 
        document.onmouseup = null;
        document.onmousemove = null;
    }

    for(child in el.children){
        position = el.getBoundingClientRect();
        child = el.children[child];
        if(!child.attributes.draggable) return;
        if(child.attributes.draggable.value == "true"){
            child.onmousedown = startDrag;
        }
        return child;
    }
}
