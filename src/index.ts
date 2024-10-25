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

type NotifyBody = {
	title: string;
	body?: string;
	colour: NotificationColour;
	options?: string[];
	position?: NotificationPosition[];
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

export type NotificationSlideDirection = 'Left' | 'Right' | undefined;

const maxNotificationTemplate: string = `
	<div class="leading-loose w-1/4 REPLACE_STYLE">
		<div
			draggable="true"
			class="cursor-grab active:cursor-grabbing w-full flex justify-end bg-REPLACE_COLOUR-500 p-1 rounded-t"
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
		<div class="w-full flex justify-between">
			<p class="mt-2 font-bold w-11/12 text-left border-b">REPLACE_TITLE</p>
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
	data: NotifyBody
): [string, NotificationSlideDirection] => {
	const selected_positions = data.position ? data.position : [];
	let position: string = '';
	let slideDirection: NotificationSlideDirection;

	if (selected_positions.includes('BOTTOM')) {
		position += ' bottom-0 mb-10';
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
	data: NotifyBody,
	notificationSize: NotificationSize,
	customConfig?: NotificationConfig
) =>
	new Promise((resolve, reject) => {
		const noteTimer: number = data.time ?? 3000;
		const configuration = customConfig || defaultConfig;
		const [position, slideDirection] = getNotificationPosition(data);
		const [notificationStyle, notificationContainerStyle] = getNotificationStyle(
			notificationSize,
			position,
			data.colour,
			slideDirection
		);

		const loading: boolean = !!data.body;

		const notificationBody = notificationTemplate(
			data,
			notificationStyle,
			data.colour,
			notificationSize,
			loading
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

				setPopFunction(configuration, btn, option, resolve, reject);
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
			$('#Dismiss').addEventListener('click', (e) => {
				const parent = getElementParent(e.target as HTMLElement);
				$$(parent).fadeOut();
			});
		}

		if (
			data.options &&
			data.options.length > 0 &&
			notification.querySelectorAll('input')[0]
		) {
			notification.querySelectorAll('input')[0].focus();
		}
	});

const notificationTemplate = (
	data: NotifyBody,
	style: string,
	colour: NotificationColour,
	type: NotificationSize,
	loading: boolean
) => {
	const replacements: { [key: string]: string | undefined } = {
		STYLE: style,
		COLOUR: colour,
		TITLE: data.title,
		BODY: data.body,
		LOADING: loading ? 'hidden' : 'block',
	};

	let notificationTemplate: string =
		type === 'MAX' ? maxNotificationTemplate : minNotificationTemplate;

	for (const replacement in replacements) {
		notificationTemplate = notificationTemplate.replaceAll(
			`REPLACE_${replacement}`,
			replacements[replacement] ?? ''
		);
	}

	return notificationTemplate;
};

const setPopFunction = (
	configuration: NotificationConfig,
	btn: HTMLButtonElement,
	query: string,
	resolve: any,
	reject: any
) => {
	for (const actions in configuration.actions) {
		const { reload, promise, close, callback, colour, options } =
			configuration.actions[actions];

		for (const option of options) {
			if (query.toString() === option.toString()) {
				btn.setAttribute(
					'class',
					`${query} w-auto min-w-24 focus:outline-none text-${colour}-400 border-${colour}-400 rounded-full border hover:bg-${colour}-400 hover:text-${colour}-100 px-2`
				);

				return btn.addEventListener('click', (e) => {
					const parent = getElementParent(e.target as HTMLElement);
					switch (true) {
						case reload:
							return window.location.reload();
						case close && !!promise:
							$$(parent).fadeOut();
							return resolve(promise);
						case !!promise:
							return resolve(promise);
						case close:
							return $$(parent).fadeOut();
						case !!callback:
							return callback(resolve, reject);
						default:
							return reject({ ACTION: 'reject' });
					}
				});
			}
		}
	}
};

const getElementParent = (element: HTMLElement | null): string => {
	if (!element) {
		throw Error('Could not obtain parent element...');
	}

	if (
		element.classList.contains('popup-cont-x') ||
		element.classList.contains('popup-cont')
	) {
		return element.classList.contains('popup-cont-x')
			? '.popup-cont-x'
			: '.popup-cont';
	}

	return getElementParent(element.parentElement as HTMLElement);
};
