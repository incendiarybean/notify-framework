// WRITTEN BY BENJAMIN WEARE 2020 //

import { NotificationSlideDirection } from '.';

///////////////////////////
// SHORTHAND GET ELEMENT //
///////////////////////////

export const $ = (query: string) => {
	const _element = document.querySelectorAll(query)[0];
	return _element;
};

/////////////////////////
// SHORTHAND FUNCTIONS //
/////////////////////////

export const $$ = (query: string) => {
	class Selector {
		readonly _element: HTMLElement;

		constructor(query: string) {
			this._element = document.querySelectorAll(query)[0] as HTMLElement;
		}

		//////////////////////////////
		// CREATE CONTAINER ACTIONS //
		//////////////////////////////

		empty() {
			while (this._element?.firstChild)
				this._element.removeChild(this._element.firstChild);
			return this;
		}

		remove() {
			this._element?.parentNode?.removeChild(this._element);
			return this;
		}

		fadeIn() {
			this._element?.classList.toggle('hidden', false);
			this._element?.classList.add('fadeIn');
			return this;
		}

		bounceOut() {
			this._element?.classList.add('bounceOut');
			this._element?.addEventListener('animationend', () => {
				this._element.parentNode?.removeChild(this._element);
				return this;
			});
		}

		slideOut(slideDir: NotificationSlideDirection) {
			if (!slideDir) slideDir = 'Left';

			this._element.classList.add(`slideOut${slideDir}`);
			this._element.addEventListener('animationend', () => {
				this._element.parentNode?.removeChild(this._element);
				return this;
			});
		}

		fadeOut() {
			this._element.classList.add('fadeOut');
			this._element.addEventListener('animationend', () => {
				this._element.parentNode?.removeChild(this._element);
				return this;
			});
		}

		show() {
			this._element.style.display = 'block';
			return this;
		}

		hide() {
			this._element.classList.add('fadeOut');
			this._element.addEventListener('animationend', () => {
				this._element.classList.toggle('hidden', true);
				return this;
			});
		}

		on(event: any, callback: any, capture: any) {
			return this._element.addEventListener(event, callback, capture);
		}
	}

	return new Selector(query);
};

///////////////////////////
// ENABLING DRAGGABLE UI //
///////////////////////////

export const drag = (el: HTMLElement) => {
	let child: any;
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;

	const startDrag = (e: DragEvent) => {
		const event = new Event('dragstart');
		child.dispatchEvent(event);
		e.preventDefault();

		pos3 = e.clientX;
		pos4 = e.clientY;

		if (!el.classList.contains('absolute')) {
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			el.style.top = el.offsetTop - pos2 + 'px';
			el.style.left = el.offsetLeft - pos1 + 'px';
			el.classList.add('absolute');
		}

		document.onmouseup = endDrag;
		(document.onmousemove as any) = dragging;
	};

	const dragging = (e: DragEvent): any => {
		e.preventDefault();

		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		el.style.top = el.offsetTop - pos2 + 'px';
		el.style.left = el.offsetLeft - pos1 + 'px';
	};

	const endDrag = () => {
		const event = new Event('dragend');

		el.dispatchEvent(event);

		document.onmouseup = null;
		document.onmousemove = null;
	};

	for (const element_child of el.children) {
		el.getBoundingClientRect();

		child = element_child;

		if (!child.attributes.draggable) return;
		if (child.attributes.draggable.value == 'true') {
			child.onmousedown = startDrag;
		}
		return child;
	}
};
