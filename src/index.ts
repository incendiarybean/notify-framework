import './min.css';

export enum NotificationPosition {
	LeftTop,
	LeftBottom,
	RightTop,
	RightBottom,
}

enum NotificationSlideDirection {
	Left = 'Left',
	Right = 'Right',
}

export enum NotificationSize {
	TOAST = 'min',
	CARD = 'max',
}

export enum NotificationColour {
	RED = 'red',
	GREEN = 'green',
	BLUE = 'blue',
	YELLOW = 'yellow',
	ORANGE = 'orange',
	PURPLE = 'purple',
	SKY = 'sky',
	EMERALD = 'emerald',
	AMBER = 'amber',
	VOILET = 'voilet',
}

type NotifyBody = {
	title: string;
	body?: string;
	colour: NotificationColour;
	options?: string[];
	position?: NotificationPosition;
	time?: number;
};

type NotificationConfig = {
	[key: string]: {
		[key: string]: {
			options: string[];
			colour: string;
			close?: boolean;
			promise?: {
				ACTION: string;
			};
			reload?: boolean;
			callback?: (resolve: any, reject: any) => void;
		};
	};
};

const maxNotificationTemplate: string = `
	<div class="leading-loose w-1/4 REPLACE_STYLE">
		<div
			draggable="true"
			class="cursor-grab active:cursor-grabbing w-full flex justify-end bg-REPLACE_COLOUR-500 p-1 rounded-t"
		>
			<svg
				class="close-btn"
				height="21"
				viewBox="0 0 21 21"
				width="21"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g
					fill="none"
					fill-rule="evenodd"
					stroke="#2a2e3b"
					stroke-linecap="round"
					stroke-linejoin="round"
					transform="translate(2 2)"
					class="cursor-pointer fill-current text-red-300 hover:fill-current hover:text-red-400"
				>
					<circle cx="8.5" cy="8.5" r="8"></circle>
					<g transform="matrix(0 1 -1 0 17 0)">
						<path d="m5.5 11.5 6-6"></path>
						<path d="m5.5 5.5 6 6"></path>
					</g>
				</g>
			</svg>
		</div>
		<p id="pop-title" class="mt-2 font-bold w-11/12 text-left border-b">
			REPLACE_TITLE
		</p>
		<div id="loading" class="REPLACE_LOADING animated py-4">
			<svg class="animate-spin -ml-1 mr-3 h-24 w-24 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
		<p
			id="pop-body"
			class="animated fast loading p-2 w-11/12 text-left text-black text-semi-bold"
		>
			REPLACE_BODY
		</p>
	</div>
`;

const minNotificationTemplate: string = `
	<div class="w-full flex flex-col REPLACE_STYLE">
		<div class="w-full flex justify-between border-b">
			<p class="font-bold w-11/12 text-left">REPLACE_TITLE</p>
			<svg
				class="close-btn"
				height="21"
				viewBox="0 0 21 21"
				width="21"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g
					fill="none"
					fill-rule="evenodd"
					stroke="#2a2e3b"
					stroke-linecap="round"
					stroke-linejoin="round"
					transform="translate(2 2)"
					class="cursor-pointer fill-current text-red-300 hover:fill-current hover:text-red-400"
				>
					<circle cx="8.5" cy="8.5" r="8"></circle>
					<g transform="matrix(0 1 -1 0 17 0)">
						<path d="m5.5 11.5 6-6"></path>
						<path d="m5.5 5.5 6 6"></path>
					</g>
				</g>
			</svg>
		</div>
		<p class="py-2 w-11/12 text-left text-black text-semi-bold">REPLACE_BODY</p>
	</div>
`;

const defaultConfig: NotificationConfig = {
	actions: {
		Dismiss: {
			options: ['Dismiss', 'No', 'Cancel'],
			close: true,
			promise: {
				ACTION: 'Dismissed',
			},
			colour: 'red',
		},
		Accept: {
			options: ['Accept', 'Yes', 'Authorize'],
			close: true,
			promise: {
				ACTION: 'Accepted',
			},
			reload: false,
			colour: 'green',
		},
		Retry: {
			options: ['Retry', 'Exit'],
			close: false,
			promise: {
				ACTION: 'Reloading',
			},
			reload: true,
			colour: 'red',
		},
	},
};

export const notifications = new Map<number, Notification>();

export class Notification {
	// Notification element
	private readonly id: number;
	private readonly notification: HTMLElement;
	private readonly notificationId: string;

	// Customisation
	private readonly notificationConfig: NotificationConfig;
	private readonly notificationTitle: string;
	private readonly notificationBody: string | undefined;
	private readonly notificationColour: NotificationColour;
	private readonly notificationSize: NotificationSize;
	private readonly notificationOptions: string[] | undefined;
	private readonly notificationLoading: boolean;
	private readonly notificationSlideDirection: NotificationSlideDirection;
	private readonly notificationPositionClass: string;
	private readonly cb: (
		resolve: (value: unknown) => void,
		reject: (value: unknown) => void
	) => void | undefined;

	// Notification timeout and removal
	private readonly timeout: number;
	private readonly expiration: ReturnType<typeof setTimeout> | undefined;

	constructor(
		id: number,
		content: NotifyBody,
		notificationSize: NotificationSize,
		callback?: any,
		extendConfig?: NotificationConfig
	) {
		const { title, body, colour, position, options, time } = content;

		this.id = id;
		this.notificationId = `popup-${id}-${notificationSize}`;
		this.notificationTitle = title;
		this.notificationBody = body;
		this.notificationColour = colour;
		this.notificationSize = notificationSize;
		this.notificationOptions = options;
		this.notificationLoading = !!body;
		this.notificationConfig = { ...defaultConfig, ...extendConfig };
		this.cb = callback;
		this.timeout = time ?? 3000;

		const [positionClass, slideDirection] =
			this.getNotificationPosition(position);
		this.notificationSlideDirection = slideDirection;
		this.notificationPositionClass = positionClass;

		const [notificationStyle, notificationContainerStyle] =
			this.getNotificationStyle();

		const notification = document.createElement('div');
		notification.id = this.notificationId;
		notification.setAttribute('class', notificationContainerStyle);
		notification.setAttribute('role', 'alert');
		notification.innerHTML = this.notificationTemplate(notificationStyle);
		this.notification = notification;

		this.enableDragging();

		notification
			.getElementsByClassName('close-btn')[0]
			.addEventListener('click', () => this.hide());

		if (this.notificationSize === NotificationSize.TOAST) {
			this.expiration = setTimeout(() => this.hide(), this.timeout);
		}
	}

	create = async () => {
		this.show();

		return await this.setOptions();
	};

	setOptions = async (): Promise<any> =>
		new Promise((resolve, reject) => {
			const buttonContainer = document.createElement('div');

			if (this.notificationOptions) {
				for (const option of this.notificationOptions) {
					const btn = document.createElement('button');

					btn.innerHTML = option;
					buttonContainer.append(btn);

					this.setPopFunction(btn, option, resolve, reject);
				}

				buttonContainer.setAttribute(
					'class',
					`btn-cont animated w-full flex justify-around ${
						this.notificationSize === NotificationSize.CARD ? 'p-4' : 'p-2'
					}`
				);

				this.notification.children[0].append(buttonContainer);
			}
		});

	show = () => {
		document.body.append(this.notification);

		if (this.notificationSize === NotificationSize.TOAST) {
			this.slideIn();
		} else {
			this.fadeIn();
		}

		return this;
	};

	hide = () => {
		if (this.notificationSize === NotificationSize.TOAST) {
			clearTimeout(this.expiration);
			this.slideOut();
		} else {
			this.fadeOut();
		}

		return this;
	};

	delete = () => {
		this.notification.parentNode?.removeChild(this.notification);

		notifications.delete(this.id);
	};

	fadeIn = () => {
		this.notification.classList.toggle('hidden', false);
		this.notification.classList.add('fadeIn');

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove('fadeIn');
		});

		return this;
	};

	fadeOut = () => {
		this.notification.classList.add('fadeOut');

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove('fadeOut');
			this.notification.classList.toggle('hidden', true);

			this.delete();
		});

		return this;
	};

	slideIn = () => {
		this.notification.classList.toggle('hidden', false);
		this.notification.classList.add(`slideIn${this.notificationSlideDirection}`);

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove(
				`slideIn${this.notificationSlideDirection}`
			);
		});

		return this;
	};

	slideOut = () => {
		this.notification.classList.add(`slideOut${this.notificationSlideDirection}`);
		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove('fadeOut');
			this.notification.classList.toggle('hidden', true);

			this.delete();
		});

		return this;
	};

	getNotificationStyle = (): string[] => {
		if (this.notificationSize === NotificationSize.TOAST) {
			return [
				`pop-min flex flex-col border-t-4 border-${this.notificationColour}-500 items-center bg-white rounded text-black text-md px-4 py-2 shadow-xl`,
				`popup-cont animated z-50 absolute ${this.notificationPositionClass} min-w-[24rem] min-h-[6rem] mx-auto px-4`,
			];
		}

		return [
			`pop-max animated bounceIn items-center flex flex-col max-w-sm mx-auto text-${this.notificationColour}-500 text-center text-md bg-white rounded shadow`,
			'popup-cont-x animated faster fixed w-full h-full items-center top-0 z-50 bg-gray-500 bg-opacity-50 flex content-center',
		];
	};

	getNotificationPosition = (
		position: NotificationPosition | undefined
	): [string, NotificationSlideDirection] => {
		switch (position) {
			case NotificationPosition.LeftBottom:
				return ['left-0 bottom-0 mb-10', NotificationSlideDirection.Left];
			case NotificationPosition.LeftTop:
				return ['left-0 top-0 mt-5', NotificationSlideDirection.Left];
			case NotificationPosition.RightBottom:
				return ['right-0 bottom-0 mb-10', NotificationSlideDirection.Right];
			case NotificationPosition.RightTop:
				return ['right-0 top-0 mt-5', NotificationSlideDirection.Right];
			default:
				return ['left-0 bottom-0 mb-10', NotificationSlideDirection.Left];
		}
	};

	notificationTemplate = (style: string) => {
		const replacements: { [key: string]: string | undefined } = {
			STYLE: style,
			COLOUR: this.notificationColour,
			TITLE: this.notificationTitle,
			BODY: this.notificationBody,
			LOADING: this.notificationLoading ? 'hidden' : 'block',
		};

		let notificationTemplate: string =
			this.notificationSize === NotificationSize.CARD
				? maxNotificationTemplate
				: minNotificationTemplate;

		for (const replacement in replacements) {
			notificationTemplate = notificationTemplate.replaceAll(
				`REPLACE_${replacement}`,
				replacements[replacement] ?? ''
			);
		}

		return notificationTemplate;
	};

	enableDragging = () => {
		const draggableElement = this.notification.firstElementChild as HTMLElement;
		let child: HTMLElement;
		let pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;

		const startDrag = (e: MouseEvent) => {
			e.preventDefault();

			draggableElement.dispatchEvent(new Event('dragstart'));

			pos1 = e.clientX;
			pos2 = e.clientY;
			pos3 = pos1 - e.clientX;
			pos4 = pos2 - e.clientY;

			draggableElement.style.left = draggableElement.offsetLeft - pos3 + 'px';
			draggableElement.style.top = draggableElement.offsetTop - pos4 + 'px';

			if (!draggableElement.classList.contains('absolute')) {
				draggableElement.classList.add('absolute');
			}

			document.onmouseup = endDrag;
			document.onmousemove = dragging;
		};

		const dragging = (e: MouseEvent): any => {
			e.preventDefault();

			pos3 = pos1 - e.clientX;
			pos4 = pos2 - e.clientY;
			pos1 = e.clientX;
			pos2 = e.clientY;

			draggableElement.style.left = draggableElement.offsetLeft - pos3 + 'px';
			draggableElement.style.top = draggableElement.offsetTop - pos4 + 'px';
		};

		const endDrag = () => {
			draggableElement.dispatchEvent(new Event('dragend'));

			document.onmouseup = null;
			document.onmousemove = null;
		};

		for (const elementChild of draggableElement.children) {
			draggableElement.getBoundingClientRect();

			child = elementChild as HTMLElement;

			if (child.draggable) {
				child.onmousedown = startDrag;
			} else {
				return;
			}

			return child;
		}
	};

	setPopFunction = async (
		btn: HTMLButtonElement,
		query: string,
		resolve: any,
		reject: any
	) => {
		for (const actions in this.notificationConfig.actions) {
			const { reload, promise, close, colour, options } =
				this.notificationConfig.actions[actions];

			for (const option of options) {
				if (query.toString() === option.toString()) {
					btn.setAttribute(
						'class',
						`${query} w-auto min-w-24 focus:outline-none text-${colour}-400 border-${colour}-400 rounded-full border hover:bg-${colour}-400 hover:text-${colour}-100 px-2`
					);

					if (this.cb) {
						return this.cb(resolve, reject);
					}

					return btn.addEventListener('click', () => {
						switch (true) {
							case reload:
								return window.location.reload();
							case close && !!promise:
								this.fadeOut();
								return resolve(promise);
							case !!promise:
								return resolve(promise);
							case close:
								return this.fadeOut();
							default:
								return reject({ ACTION: 'reject' });
						}
					});
				}
			}
		}
	};
}

export const createNotification = async (
	data: NotifyBody,
	notificationSize: NotificationSize,
	callback?: (args: any) => any,
	extendConfig?: NotificationConfig
) => {
	const notification = new Notification(
		notifications.values.length + 1,
		data,
		notificationSize,
		callback,
		extendConfig
	);

	notifications.set(notifications.values.length, notification);

	return notification.create();
};
