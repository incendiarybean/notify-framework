import './min.css';

type NotificationConfig = {
	[key: string]: {
		options?: string[];
		colour?: NotificationColour;
		close?: boolean;
		promise?: {
			ACTION: string;
		};
		reload?: boolean;
	};
};

type NotificationOptions = {
	title?: string;
	message?: string;
	colour?: NotificationColour;
};

type NotificationToastOptions = {
	message: string;
	colour?: NotificationColour;
	position?: NotificationPosition;
	timeout?: number;
};

type NotificationCallback = (
	resolve: (args: any) => void,
	reject: (args: any) => void,
	notification: NotificationCard
) => any;

type NotificationCardOptions = {
	title: string;
	message?: string;
	colour?: NotificationColour;
	buttons?: string[];
	callback?: NotificationCallback;
	configExtends?: NotificationConfig;
};

enum NotificationSlideDirection {
	Left = 'Left',
	Right = 'Right',
}

export enum NotificationSize {
	TOAST,
	CARD,
}

export enum NotificationPosition {
	LeftTop,
	LeftBottom,
	RightTop,
	RightBottom,
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

const maxNotificationTemplate: string = `
	<div class="leading-loose w-1/4 REPLACE_STYLE">
		<div
			draggable="true"
			class="cursor-grab active:cursor-grabbing w-full flex justify-end bg-REPLACE_COLOUR-500 p-1 rounded-t"
		>			
			<svg
				class="close-btn cursor-pointer"
				height="21"
				viewBox="0 0 21 21"
				width="21"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g
					class="fill-current text-red-300 hover:fill-current hover:text-red-400"
					fill-rule="evenodd"
					stroke="#2a2e3b"
					stroke-linecap="round"
					stroke-linejoin="round"
					transform="translate(2 2)"
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
		<div hidden="true" id="loading" class="loading-spinner animated py-4">
			<svg class="animate-spin -ml-1 mr-3 h-24 w-24 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
		<p
			class="pop-body-content animated fast p-2 w-11/12 text-left text-black text-semi-bold"
		>
			REPLACE_MESSAGE
		</p>
	</div>
`;

const minNotificationTemplate: string = `
	<div class="w-full REPLACE_STYLE">
		<div class="w-full flex justify-between items-center select-none">
			<p class="py-2 w-11/12 text-left text-black text-semi-bold text-ellipsis">REPLACE_MESSAGE</p>
			<svg class="close-btn cursor-pointer fill-current text-red-300 hover:fill-current hover:text-red-400 active:text-red-500 w-1/12" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-416.35 287.83-224.17Q275.15-211.5 256-211.5t-31.83-12.67Q211.5-236.85 211.5-256t12.67-31.83L416.35-480 224.17-672.17Q211.5-684.85 211.5-704t12.67-31.83Q236.85-748.5 256-748.5t31.83 12.67L480-543.65l192.17-192.18Q684.85-748.5 704-748.5t31.83 12.67Q748.5-723.15 748.5-704t-12.67 31.83L543.65-480l192.18 192.17Q748.5-275.15 748.5-256t-12.67 31.83Q723.15-211.5 704-211.5t-31.83-12.67L480-416.35Z"/></svg>
		</div>
	</div>
`;

const defaultConfig: NotificationConfig = {
	Dismiss: {
		options: ['Dismiss', 'No', 'Cancel'],
		close: true,
		promise: {
			ACTION: 'Dismissed',
		},
		colour: NotificationColour.RED,
	},
	Accept: {
		options: ['Accept', 'Yes', 'Authorize'],
		close: true,
		promise: {
			ACTION: 'Accepted',
		},
		reload: false,
		colour: NotificationColour.GREEN,
	},
	Retry: {
		options: ['Retry', 'Exit'],
		close: false,
		promise: {
			ACTION: 'Reloading',
		},
		reload: true,
		colour: NotificationColour.RED,
	},
};

export const notifications = new Map<number, Notification>();

class Notification {
	// Notification element
	private readonly id: number;
	readonly notification: HTMLElement;
	private readonly notificationId: string;

	// Customisation
	readonly notificationTitle?: string;
	public notificationMessage?: string;
	public readonly notificationColour?: NotificationColour;
	public readonly notificationSize: NotificationSize;
	public notificationContainerStyle?: string;
	public notificationStyle?: string;

	constructor(
		id: number,
		options: NotificationOptions,
		notificationSize: NotificationSize
	) {
		const { title, message, colour } = options;

		this.id = id;
		this.notificationId = `popup-${id}-${notificationSize}`;
		this.notificationTitle = title;
		this.notificationMessage = message;
		this.notificationColour = colour;
		this.notificationSize = notificationSize;

		const notification = document.createElement('div');
		notification.id = this.notificationId;
		notification.setAttribute('role', 'alert');
		this.notification = notification;
	}

	/**
	 * A function to delete the notification from the pool.
	 */
	delete = () => {
		this.notification.parentNode?.removeChild(this.notification);

		notifications.delete(this.id);
	};

	/**
	 * A function to obtain the default styling of the notification.
	 */
	getNotificationStyle = (): string[] => {
		if (this.notificationSize === NotificationSize.TOAST) {
			return [
				`pop-min flex flex-col items-center justify-center bg-white rounded text-black text-md px-4 py-2 shadow-xl min-h-[5rem] border-t-4 border-${this.notificationColour}-500`,
				'popup-cont absolute z-50 animated min-w-[24rem] mx-auto px-4 ',
			];
		}

		return [
			`pop-max animated bounceIn items-center flex flex-col max-w-sm mx-auto text-center text-md bg-white rounded shadow text-${this.notificationColour}-500`,
			'popup-cont-x animated faster fixed w-full h-full items-center top-0 z-50 bg-gray-500 bg-opacity-50 flex content-center',
		];
	};

	/**
	 * A function to generate the appropriate element from the HTML template.
	 */
	notificationTemplate = (style: string) => {
		const replacements: { [key: string]: string | undefined } = {
			STYLE: style,
			COLOUR: this.notificationColour,
			TITLE: this.notificationTitle,
			MESSAGE: this.notificationMessage,
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
}

class NotificationCard extends Notification {
	private readonly notificationConfig: NotificationConfig;
	private readonly callback?: NotificationCallback;
	private readonly notificationButtons?: string[];
	private loading: boolean = false;

	constructor(
		id: number,
		title: string,
		message?: string,
		colour: NotificationColour = NotificationColour.BLUE,
		buttons?: string[],
		callback?: NotificationCallback,
		configExtends?: NotificationConfig
	) {
		super(id, { title, message, colour }, NotificationSize.CARD);

		for (const extension in configExtends) {
			defaultConfig[extension] = {
				...defaultConfig[extension],
				...configExtends[extension],
			};
		}

		this.notificationConfig = defaultConfig;

		this.notificationButtons = buttons;

		this.callback = callback;

		const [notificationStyle, notificationContainerStyle] =
			this.getNotificationStyle();

		this.notificationContainerStyle = notificationContainerStyle;
		this.notificationStyle = notificationStyle;

		this.setContent().closeHandler().enableDragging().show();
	}

	/**
	 * A function to enable the close button on the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly closeHandler = () => {
		this.notification
			.getElementsByClassName('close-btn')[0]
			.addEventListener('click', () => this.hide());

		return this;
	};

	/**
	 * An alias to the fadeIn function to fade in the notification.
	 *
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => {setTimeout(() => notification.show()), 5000);}})
	 *
	 * @returns The current notification for optional chaining.
	 */
	public show = () => {
		document.body.append(this.notification);
		this.fadeIn();

		return this;
	};

	/**
	 * An alias to the fadeOut function to fade out the notification.
	 *
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => {setTimeout(() => notification.hide()), 5000);}})
	 *
	 * @returns The current notification for optional chaining.
	 */
	public hide = () => {
		this.fadeOut();

		return this;
	};

	/**
	 * A function to fade in the notification.
	 *
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => {setTimeout(() => notification.fadeIn()), 5000);}})
	 *
	 * @returns The current notification for optional chaining.
	 */
	public fadeIn = () => {
		this.notification.classList.toggle('hidden', false);
		this.notification.classList.add('fadeIn');

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove('fadeIn');
		});

		return this;
	};

	/**
	 * A function to fade out the notification and remove it.
	 *
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => {setTimeout(() => notification.fadeOut()), 5000);}})
	 *
	 * @returns The current notification for optional chaining.
	 */
	public fadeOut = () => {
		this.notification.classList.add('fadeOut');

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.toggle('hidden', true);

			this.delete();
		});

		return this;
	};

	/**
	 * A function to enable the loading spinner to phase in/out and then display the body/buttons.
	 *
	 * @param {boolean} value - Displays a loading spinner depending on loading state, defaults to the opposite of the current loading state.
	 *
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => {notification.setLoading(true); setTimeout(() => notification.setLoading(false), 5000);}})
	 *
	 * @returns The current notification for optional chaining.
	 */
	public readonly setLoading = (value: boolean = !this.loading) => {
		this.loading = value;

		const spinner = this.notification.getElementsByClassName(
			'loading-spinner'
		)[0] as HTMLElement;

		const buttonContainer = this.notification.getElementsByClassName(
			'btn-cont'
		)[0] as HTMLElement;

		const body = this.notification.getElementsByClassName(
			'pop-body-content'
		)[0] as HTMLElement;

		if (this.loading) {
			// Hide buttons
			buttonContainer.hidden = this.loading;
			buttonContainer.classList.remove('flex');

			// Hide body content
			body.hidden = this.loading;

			// Show loader
			spinner.classList.add('fadeIn');
			spinner.hidden = false;
			spinner.addEventListener('animationend', () => {
				spinner.classList.remove('fadeIn');
			});
		} else {
			// Hide loader
			spinner.classList.add('fadeOut');
			spinner.addEventListener('animationend', () => {
				spinner.classList.remove('fadeOut');
				spinner.hidden = true;

				// Show body content
				body.classList.add('flex', 'fadeIn');
				body.addEventListener('animationend', () => {
					body.classList.remove('fadeIn');
				});

				// Show buttons
				buttonContainer.classList.add('flex', 'fadeIn');
				buttonContainer.addEventListener('animationend', () => {
					buttonContainer.classList.remove('fadeIn');
				});
			});
		}

		return this;
	};

	/**
	 * A function to set the initial content, using the provided title and body.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly setContent = () => {
		this.notification.classList.value = this.notificationContainerStyle ?? '';
		this.notification.innerHTML = this.notificationTemplate(
			this.notificationStyle ?? ''
		);

		return this;
	};

	/**
	 * A function to update the HTML content of the current notification.
	 * This can be used within the callback function e.g:
	 * @example
	 * const div = document.createElement('div');
	 * await Card({callback: async (_resolve, _reject, notification) => notification.setTextContent(div)})
	 *
	 * @param HTMLElement - A value to set the body of the notification to.
	 *
	 * @returns The current notification for optional chaining.
	 */
	public readonly setHTMLContent = (value: HTMLElement) => {
		const body = this.notification.getElementsByClassName(
			'pop-body-content'
		)[0] as HTMLElement;

		if (body) {
			body.innerHTML = value.outerHTML;
		}

		return this;
	};

	/**
	 * A function to update the text content of the current notification.
	 * This can be used within the callback function e.g:
	 * @example
	 * await Card({callback: async (_resolve, _reject, notification) => notification.setTextContent("test!")})
	 *
	 * @param string - A value to set the body of the notification to.
	 *
	 * @returns The current notification for optional chaining.
	 */
	public readonly setTextContent = (value: string) => {
		const body = this.notification.getElementsByClassName(
			'pop-body-content'
		)[0] as HTMLElement;

		if (body) {
			body.textContent = value;
		}

		return this;
	};

	/**
	 * A function that handles returning a result from either of the provided events (button/callback).
	 *
	 * @returns Returns the resolution of either the callback function or the response of a button handler.
	 */
	public readonly eventHandler = async () => {
		const promises: Promise<any>[] = [];

		if (this.notificationButtons) {
			promises.push(this.buttonHandler());
		}

		if (typeof this.callback !== 'undefined') {
			promises.push(this.callbackHandler());
		}

		return await Promise.any(promises);
	};

	/**
	 *
	 * @returns Returns the resolution of a promise from the provided callback function.
	 */
	private readonly callbackHandler = () =>
		new Promise<any>((resolve, reject) => {
			if (typeof this.callback === 'function') {
				this.callback(resolve, reject, this);
			}
		});

	/**
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly buttonHandler = async () =>
		new Promise<any>((resolve, reject) => {
			const buttonContainer = document.createElement('div');
			buttonContainer.classList.value = `btn-cont animated w-full flex justify-around ${
				this.notificationSize === NotificationSize.CARD ? 'p-4' : 'p-2'
			}`;

			const buttonConfigurations =
				this.notificationButtons
					?.map((button) => {
						const buttonValues = Object.values(this.notificationConfig).filter(
							(configEntry) => configEntry?.options?.includes(button)
						);

						if (buttonValues && buttonValues.length > 0) {
							return { ...buttonValues[0], value: button };
						}
					})
					.filter((value) => value) ?? [];

			this.notification
				.getElementsByClassName('close-btn')[0]
				.addEventListener('click', () => {
					this.hide();
					return resolve({ ACTION: 'Dismissed' });
				});

			for (const buttonConfiguration of buttonConfigurations) {
				const button = document.createElement('button');
				const buttonColour = buttonConfiguration?.colour;
				const buttonValue = buttonConfiguration?.value;
				const buttonPromise = buttonConfiguration?.promise;
				const buttonReload = buttonConfiguration?.reload;
				const buttonClose = buttonConfiguration?.close;

				button.innerHTML = buttonValue ?? '';
				button.setAttribute(
					'class',
					`${buttonValue} w-auto min-w-24 focus:outline-none text-${buttonColour}-400 border-${buttonColour}-400 rounded-full border hover:bg-${buttonColour}-400 hover:text-${buttonColour}-100 px-2`
				);

				button.addEventListener('click', () => {
					switch (true) {
						case buttonReload:
							return window.location.reload();
						case !!buttonPromise:
							this.fadeOut();
							return resolve(buttonPromise);
						case buttonClose:
							this.fadeOut();
							return resolve({ ACTION: 'Dismissed' });
						default:
							return reject(Error('No handler was attached to this button.'));
					}
				});

				buttonContainer.append(button);
			}

			this.notification.children[0].append(buttonContainer);
		});

	/**
	 * A function that enables the notification to be draggable.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly enableDragging = () => {
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
				continue;
			}
		}

		return this;
	};
}

class NotificationToast extends Notification {
	private readonly timeout: number;
	private readonly expiration: ReturnType<typeof setTimeout> | undefined;
	private readonly notificationSlideDirection: NotificationSlideDirection;
	private readonly notificationPositionClass: string;

	constructor(
		id: number,
		message: string,
		colour: NotificationColour = NotificationColour.BLUE,
		position: NotificationPosition = NotificationPosition.LeftBottom,
		timeout: number = 3000
	) {
		super(id, { message, colour }, NotificationSize.TOAST);

		this.timeout = timeout;

		const [positionClass, slideDirection] =
			this.getNotificationPosition(position);

		this.notificationPositionClass = positionClass;
		this.notificationSlideDirection = slideDirection;

		const [notificationStyle, notificationContainerStyle] =
			this.getNotificationStyle();

		this.notificationContainerStyle =
			notificationContainerStyle + this.notificationPositionClass;
		this.notificationStyle = notificationStyle;

		this.expiration = setTimeout(() => this.hide(), this.timeout);

		this.setContent();
		this.closeHandler();
		this.show();
	}

	/**
	 * A function to enable the close button on the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly closeHandler = () => {
		this.notification
			.getElementsByClassName('close-btn')[0]
			.addEventListener('click', () => this.hide());

		return this;
	};

	/**
	 *
	 * @param NotificationPosition - The position of the notification.
	 *
	 * @returns The classname of the notification position and the direction the notification should slide.
	 */
	private readonly getNotificationPosition = (
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

	/**
	 * An alias to the slideIn function to fade in the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly show = () => {
		document.body.append(this.notification);
		this.slideIn();

		return this;
	};

	/**
	 * An alias to the slideOut function to fade in the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly hide = () => {
		clearTimeout(this.expiration);
		this.slideOut();

		return this;
	};

	/**
	 * A function to set the initial content, using the provided title and body.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly setContent = () => {
		this.notification.classList.value = this.notificationContainerStyle ?? '';
		this.notification.innerHTML = this.notificationTemplate(
			this.notificationStyle ?? ''
		);

		return this;
	};

	/**
	 * A function to slide in the notification from the desired direction.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly slideIn = () => {
		this.notification.classList.toggle('hidden', false);
		this.notification.classList.add(`slideIn${this.notificationSlideDirection}`);

		this.notification.addEventListener('animationend', () => {
			this.notification.classList.remove(
				`slideIn${this.notificationSlideDirection}`
			);
		});

		return this;
	};

	/**
	 * A function to slide out the notification in the desired direction and delete it.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly slideOut = () => {
		this.notification.classList.add(`slideOut${this.notificationSlideDirection}`);
		this.notification.addEventListener('animationend', () => {
			this.notification.classList.toggle('hidden', true);

			this.delete();
		});

		return this;
	};
}

/**
 * A function to get the next ID in the notifications list.
 */
const getId = (): number => {
	const previousId = notifications.entries().toArray().length
		? notifications.entries().toArray()[
				notifications.entries().toArray().length - 1
		  ][0]
		: 0;

	return previousId + 1;
};

/**
 * Create a Toast Notification.
 *
 * @example
 * Toast({message: "✅ This is a message!", NotificationColour.RED })
 *
 * @param NotificationToastOptions - An object containing the message, colour, position and timeout.
 */
export const Toast = ({
	message,
	colour,
	position,
	timeout,
}: NotificationToastOptions) => {
	const id = getId();

	notifications.set(
		id,
		new NotificationToast(id, message, colour, position, timeout)
	);
};

/**
 * Create a Card Notification. Optional callback and button promises resolvers.
 *
 * @example
 * const response = await Card({title: "Title", NotificationColour.RED, buttons: ["Yes", "No"]});
 *
 * @param NotificationCardOptions - An object containing the message, colour, position and timeout.
 */
export const Card = async ({
	title,
	message,
	colour,
	buttons,
	callback,
	configExtends,
}: NotificationCardOptions) => {
	const id = getId();
	const notification = new NotificationCard(
		id,
		title,
		message,
		colour,
		buttons,
		callback,
		configExtends
	);

	notifications.set(id, notification);

	return await notification.eventHandler();
};
