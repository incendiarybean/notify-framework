import './min.css';

import { $, $$, drag } from './framework';

type NotificationPosition = 'LEFT' | 'TOP' | 'BOTTOM' | 'RIGHT';

type NotificationSize = 'MAX' | 'MIN';

type NotificationColour =
	| 'red'
	| 'green'
	| 'blue'
	| 'yellow'
	| 'orange'
	| 'purple'
	| 'sky'
	| 'emerald'
	| 'amber'
	| 'voilet';

type NotifyConfig = {
	title: string;
	body: string;
	colour: NotificationColour;
	options?: string[];
	position?: NotificationPosition[];
	time?: number;
};

export type NotificationSlideDirection = 'Left' | 'Right' | undefined;

const defaultConfig: any = {
	actions: {
		Dismiss: {
			options: ['Dismiss', 'No', 'Cancel'],
			close: true,
			resolve: true,
			reload: false,
			returnComment: {
				ACTION: 'Dismissed',
			},
			colour: 'red',
		},
		Accept: {
			options: ['Accept', 'Yes'],
			close: true,
			resolve: true,
			reload: false,
			returnComment: {
				ACTION: 'Accepted',
			},
			colour: 'green',
		},
		Retry: {
			options: ['Retry', 'Exit'],
			close: false,
			resolve: false,
			reload: true,
			returnComment: {
				ACTION: 'Reloading',
			},
			colour: 'red',
		},
	},
};

const getNotificationStyle = (
	size: NotificationSize,
	position: string,
	colour: string,
	slideAnimation: NotificationSlideDirection
): string[] => {
	if (size === 'MIN') {
		return [
			'pop-min',
			`popup-cont animated slideIn${slideAnimation} fast shadow-lg flex z-50 flex-col absolute ${position} w-64 mx-auto border-t-4 border-${colour}-500 items-center bg-white rounded-b text-black text-md px-4 py-3`,
		];
	}

	return [
		`pop-max animated bounceIn items-center flex flex-col max-w-sm mx-auto text-${colour}-500 text-center text-md bg-white rounded shadow`,
		'popup-cont-x animated faster fixed w-full h-full items-center top-0 z-50 bg-gray-500 bg-opacity-50 flex content-center',
	];
};

const getNotificationPosition = (
	data: NotifyConfig
): [string, NotificationSlideDirection] => {
	const selected_positions = data.position ? data.position : [];
	let position: string = '';
	let slideDirection: NotificationSlideDirection;

	if (selected_positions.includes('BOTTOM')) {
		position += ' bottom-0 mb-5';
	}
	if (selected_positions.includes('TOP')) {
		position += ' top-0 mt-5';
	}

	if (selected_positions.includes('LEFT')) {
		position += ' left-0';
		slideDirection = 'Left';
	}

	if (selected_positions.includes('RIGHT')) {
		position += ' right-0';
		slideDirection = 'Right';
	}

	if (
		!selected_positions.includes('TOP') &&
		!selected_positions.includes('BOTTOM')
	) {
		position += ' bottom-0 mb-5';
	}

	if (
		!selected_positions.includes('LEFT') &&
		!selected_positions.includes('RIGHT')
	) {
		position += ' left-0';
		slideDirection = 'Left';
	}

	return [position, slideDirection];
};

export const Notify = (
	data: NotifyConfig,
	notificationSize: NotificationSize,
	customConfig?: any
) =>
	new Promise((resolve, reject) => {
		let noteTimer: number = 3000;
		const configuration = customConfig || defaultConfig;
		const [position, slideDirection] = getNotificationPosition(data);
		const [notificationStyle, notificationContainerStyle] = getNotificationStyle(
			notificationSize,
			position,
			data.colour,
			slideDirection
		);

		if (notificationSize === 'MIN') {
			if (data.time) {
				noteTimer = data.time;
			}
		}

		const notificationBody = notificationTemplate(
			data,
			notificationStyle,
			data.colour,
			notificationSize
		);

		const notification = document.createElement('div');
		notification.setAttribute('class', notificationContainerStyle);
		notification.setAttribute('role', 'alert');
		notification.id = 'popup';
		notification.innerHTML = notificationBody;

		if (data.options && data.options.length > 0) {
			const options = data.options;
			const buttonContainer = document.createElement('div');

			for (const option of options) {
				const btn = document.createElement('button');

				btn.innerHTML = option;
				buttonContainer.append(btn);

				setPopFunction(
					notificationSize,
					configuration,
					btn,
					option,
					resolve,
					reject
				);
			}

			if (notificationSize === 'MIN') {
				buttonContainer.setAttribute(
					'class',
					'btn-cont animated p-2 w-full flex justify-around'
				);
			}

			if (notificationSize === 'MAX') {
				buttonContainer.setAttribute(
					'class',
					'btn-cont animated p-4 w-full flex justify-around'
				);
			}

			notification.children[0].append(buttonContainer);
		} else if (notificationSize !== 'MAX') {
			setTimeout(() => {
				if ($('.popup-cont')) {
					$$('.popup-cont').slideOut(slideDirection);
				}
			}, noteTimer);
		}

		document.body.append(notification);

		drag(notification.firstElementChild as HTMLElement);

		if ($('#Dismiss')) {
			$('#Dismiss').addEventListener('click', () => {
				$$('.popup-cont-x').fadeOut();
			});
		}

		if (
			data.options &&
			data.options.length > 0 &&
			notification.querySelectorAll('input')[0]
		) {
			notification.querySelectorAll('input')[0].focus();
		}
	}).catch((reject) => {
		console.log(reject);
	});

const notificationTemplate = (
	data: NotifyConfig,
	style: string,
	colour: NotificationColour,
	type: NotificationSize
) => {
	let isLoading = 'block';

	if (data.body) {
		isLoading = 'hidden';
	}

	if (type === 'MAX') {
		return `
			<div class="leading-loose w-1/4 ${style}">
				<div
					draggable="true"
					class="cursor-grab active:cursor-grabbing w-full flex justify-end bg-${colour}-500 p-1 rounded-t"
				>
					<svg
						id="Dismiss"
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
							class="Dismiss cursor-pointer hover:fill-current text-red-300"
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
					${data.title}
				</p>
				<div id="loading" class="${isLoading} animated py-4">
					<div
						class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"
					></div>
				</div>
				<p
					id="pop-body"
					class="animated fast loading p-2 w-11/12 text-left text-black text-semi-bold"
				>
					${data.body}
				</p>
			</div>
		`;
	}
	return `
		<div class="w-full ${style}">
			<p class="mt-2 font-bold w-11/12 text-left border-b">${data.title}</p>
			<p class="py-2 w-11/12 text-left text-black text-semi-bold">${data.body}</p>
		</div>
	`;
};

const setPopFunction = (
	notificationSize: NotificationSize,
	configuration: any,
	btn: HTMLButtonElement,
	query: string,
	resolve: any,
	reject: any
) => {
	for (const actions in configuration.actions) {
		const item_conf = configuration.actions[actions];
		for (const options of item_conf.options) {
			if (query.toString() === options.toString()) {
				btn.setAttribute(
					'class',
					`${query} w-24 focus:outline-none text-${item_conf.colour}-400 border-${item_conf.colour}-400 rounded-full hover:bg-${item_conf.colour}-400 hover:text-${item_conf.colour}-100 px-2`
				);

				return btn.addEventListener('click', () => {
					if (notificationSize == 'MAX' && item_conf.close) {
						$$('.popup-cont-x').fadeOut();
					} else if (item_conf.close) {
						$$('.popup-cont').fadeOut();
					}
					if (item_conf.reload) window.location.reload();
					if (item_conf.resolve) resolve(item_conf.returnComment);
					if (!item_conf.resolve) reject(item_conf.returnComment);
				});
			}
		}
	}
};
