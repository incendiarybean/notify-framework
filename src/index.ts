import './min.css';

type ButtonConfiguration = {
	value?: string;
	options?: string[];
	colour?: NotificationColour;
	close?: boolean;
	promise?: {
		ACTION: string;
	};
	reload?: boolean;
	callback?: NotificationCallback;
};

type NotificationConfig = {
	[key: string]: ButtonConfiguration;
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

export enum NotificationStyle {
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
	AMBER = 'amber',
	BLUE = 'blue',
	EMERALD = 'emerald',
	GREEN = 'green',
	RED = 'red',
	ORANGE = 'orange',
	PURPLE = 'purple',
	SKY = 'sky',
	VIOLET = 'violet',
	YELLOW = 'yellow',
}

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

const cardNotificationTemplate: string = `
	<div class="notify-card w-1/4 min-w-52 animated bounceIn items-center flex flex-col max-w-md mx-auto text-center text-md bg-white dark:bg-zinc-900 rounded rounded-t-xl shadow-xl">
		<div
			draggable="true"
			class="notify-card-title-bar cursor-grab active:cursor-grabbing w-full flex justify-between rounded-t items-center p-2"
		>
			<h1 class="notify-card-title ml-1 text-white font-semibold w-full text-left tracking-wide font-sans truncate uppercase antialiased"></h1>
			<button aria-label="Close Popup" type="button" class="close-btn w-5 h-5 rounded bg-red-400 hover:bg-red-500 flex items-center justify-around">
				<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>
			</button>
		</div>
		<div class="notify-card-body w-full h-auto flex flex-col gap-2 min-h-8 p-2">
			<div hidden="true" class="loading-spinner animated py-4 w-full" role="status">
				<div class="flex items-center justify-around"> 
					<div class="my-8 flex flex-row gap-2">
						<span class="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow animate-bounce"></span>
						<span class="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow animate-bounce [animation-delay:-.3s]"></span>
						<span class="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow animate-bounce [animation-delay:-.5s]"></span>
						<span class="sr-only">Loading...</span>
					</div>
				</div>
			</div>
			<div class="notify-card-body-content w-full h-auto px-2 animated fast text-black dark:text-white">
				<p class="notify-card-message leading-snug font-sansmt-1 text-left"></p>
			<div>
		</div>
	</div>
`;

const toastNotificationTemplate: string = `
	<div class="notify-toast w-full bg-white dark:bg-zinc-900 border-2 border-b-0 border-zinc-100 dark:border-zinc-800 rounded text-black dark:text-white text-md shadow-xl min-h-[4rem] flex flex-col justify-between">
		<div class="w-full flex justify-between items-center select-none px-4 py-2">
			<p class="notify-toast-message py-2 w-11/12 text-left text-semi-bold text-ellipsis"></p>
			<svg class="close-btn cursor-pointer fill-current text-red-300 dark:text-red-400 hover:fill-current hover:text-red-400 hover:dark:text-red-600 w-1/12" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-416.35 287.83-224.17Q275.15-211.5 256-211.5t-31.83-12.67Q211.5-236.85 211.5-256t12.67-31.83L416.35-480 224.17-672.17Q211.5-684.85 211.5-704t12.67-31.83Q236.85-748.5 256-748.5t31.83 12.67L480-543.65l192.17-192.18Q684.85-748.5 704-748.5t31.83 12.67Q748.5-723.15 748.5-704t-12.67 31.83L543.65-480l192.18 192.17Q748.5-275.15 748.5-256t-12.67 31.83Q723.15-211.5 704-211.5t-31.83-12.67L480-416.35Z"/></svg>
		</div>
		<div class="notify-toast-timeout z-10 h-1 transition-all rounded-b" style="width: 100%;"></div>
	</div>
`;

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
	public readonly notificationStyle: NotificationStyle;

	constructor(
		id: number,
		options: NotificationOptions,
		notificationStyle: NotificationStyle
	) {
		const { title, message, colour } = options;

		this.id = id;
		this.notificationId = `popup-${id}-${notificationStyle}`;
		this.notificationTitle = title;
		this.notificationMessage = message;
		this.notificationColour = colour;
		this.notificationStyle = notificationStyle;

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
		super(id, { title, message, colour }, NotificationStyle.CARD);

		for (const extension in configExtends) {
			defaultConfig[extension] = {
				...defaultConfig[extension],
				...configExtends[extension],
			};
		}

		this.notificationConfig = defaultConfig;

		this.notificationButtons = buttons;

		this.callback = callback;

		this.buildNotification().addCloseHandler().addDragging().show();
	}

	/**
	 * A function to enable the close button on the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly addCloseHandler = () => {
		const closeBtn = this.notification.getElementsByClassName('close-btn')[0];

		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.hide());
		}

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
			'notify-card-body-content'
		)[0] as HTMLElement;

		const elementsExist = spinner && buttonContainer && body;
		if (this.loading && elementsExist) {
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
		} else if (elementsExist) {
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
	private readonly buildNotification = () => {
		this.notification.classList.value =
			'notify-card-container animated faster fixed w-full h-full items-center top-0 z-50 bg-gray-500 bg-opacity-50 flex content-center';
		this.notification.innerHTML = cardNotificationTemplate;

		const draggableBarElement = this.notification.getElementsByClassName(
			'notify-card-title-bar'
		)[0];
		if (draggableBarElement) {
			draggableBarElement.classList.add(`bg-${this.notificationColour}-500`);
		}

		const headerElement =
			this.notification.getElementsByClassName('notify-card-title')[0];
		if (headerElement) {
			headerElement.textContent = this.notificationTitle ?? '';
		}

		const messageElement = this.notification.getElementsByClassName(
			'notify-card-message'
		)[0];
		if (messageElement) {
			messageElement.textContent = this.notificationMessage ?? '';
		}

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
			'notify-card-body-content'
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
			'notify-card-body-content'
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
	public readonly eventHandler = async (): Promise<any> => {
		const promises: Promise<any>[] = [];

		if (this.notificationButtons) {
			promises.push(this.buttonHandler());
		}

		if (typeof this.callback !== 'undefined') {
			promises.push(this.callbackHandler());
		}

		if (promises.length > 0) {
			return await Promise.any(promises);
		}

		return Promise.resolve();
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
			buttonContainer.classList.value = `btn-cont animated w-full flex gap-2 justify-around flex-wrap p-2`;

			this.notification
				.getElementsByClassName('close-btn')[0]
				.addEventListener('click', () => {
					this.hide();
					return resolve({ ACTION: 'Dismissed' });
				});

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

			for (const buttonConfiguration of buttonConfigurations) {
				const { colour, value, promise, reload, close, callback } =
					buttonConfiguration as ButtonConfiguration;

				const button = document.createElement('button');
				button.innerHTML = value ?? '';
				button.type = 'button';
				button.ariaLabel = `Option: ${value}`;
				button.classList.value = `${value} grow min-w-24 text-${colour}-600 dark:text-${colour}-400 hover:text-white focus:text-white border border-${colour}-400 rounded hover:bg-${colour}-500 focus:bg-${colour}-500 p-2`;

				button.addEventListener('click', () => {
					switch (true) {
						case !!callback:
							return callback(resolve, reject, this);
						case reload:
							return window.location.reload();
						case !!promise:
							this.fadeOut();
							return resolve(promise);
						case close:
							this.fadeOut();
							return resolve({ ACTION: 'Dismissed' });
						default:
							return reject(Error('No handler was attached to this button.'));
					}
				});

				buttonContainer.append(button);
			}

			this.notification
				.getElementsByClassName('notify-card-body')[0]
				.append(buttonContainer);
		});

	/**
	 * A function that enables the notification to be draggable.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly addDragging = () => {
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
		timeout: number = 5000
	) {
		super(id, { message, colour }, NotificationStyle.TOAST);

		this.timeout = timeout;

		const [positionClass, slideDirection] =
			this.getNotificationPosition(position);

		this.notificationPositionClass = positionClass;
		this.notificationSlideDirection = slideDirection;

		this.expiration = setTimeout(() => this.hide(), this.timeout);

		this.buildNotification().addTimeoutAnimation().addCloseHandler().show();
	}

	/**
	 * A function to enable the close button on the notification.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly addCloseHandler = () => {
		const closeBtn = this.notification.getElementsByClassName('close-btn')[0];

		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.hide());
		}

		return this;
	};

	/**
	 * A function to display the current time left on the notification timeout.
	 *
	 * @returns The current notification for optional chaining.
	 */
	private readonly addTimeoutAnimation = () => {
		const timeoutBar = this.notification.getElementsByClassName(
			'notify-toast-timeout'
		)[0];

		if (timeoutBar) {
			timeoutBar.classList.add(`bg-${this.notificationColour}-400`);
			timeoutBar.animate(
				[
					{
						width: '100%',
					},
					{
						width: '0px',
					},
				],
				{ duration: this.timeout - 5, fill: 'forwards' }
			);
		}

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
	private readonly buildNotification = () => {
		this.notification.classList.value = `notify-toast-container absolute z-50 animated min-w-[24rem] mx-auto px-4 ${this.notificationPositionClass}`;
		this.notification.innerHTML = toastNotificationTemplate;

		const messageElement = this.notification.getElementsByClassName(
			'notify-toast-message'
		)[0];
		if (messageElement) {
			messageElement.textContent = this.notificationMessage ?? '';
		}

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
