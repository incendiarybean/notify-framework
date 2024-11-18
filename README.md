# Notify Framework

Notify-Framework is an extremely lightweight NPM module for creating pop-up notifications.

This module uses TailwindCSS and Animate.css and must be installed alongside it.

## Installation

Use [NPM](https://www.npmjs.com/) to install it and the other 2 requirements with the below command:

```bash
npm install @incendiarybean/notify-framework --save
```

# Usage

Import either of the Notificatin Types (Card, Toast):

```typescript
import { Card, Toast } from '@incendiarybean/notify-framework';
```

## Making a large popup notification with buttons:

```typescript
const response = await Card({
	title: 'Title',
	colour: NotificationColour.RED,
	buttons: ['Yes', 'No'],
});
return console.log(response);
```

The max popup can be moved around the screen using the draggable feature of the module:

You can also customise the buttons that appear on the notification through an extendable parameter, it will combine any currently available default config with your provided config:

```typescript
const response = await Card({
	title: 'Title',
	colour: NotificationColour.AMBER,
	buttons: ['Yes', 'Dismiss'],
	configExtends: {
		Dismiss: {
			options: ['Dismiss'],
			colour: NotificationColour.RED,
			close: true,
			promise: {
				ACTION: 'Dismissed',
			},
		},
	},
});
return console.log(response);
```

The above example extends the dismiss property button to close the window and resolve the promise with an ACTION of `Dismissed`. The button is also red.

Available options are from the following:

```typescript
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
```

Available Colours:

```typescript
enum NotificationColour {
	RED = 'red',
	GREEN = 'green',
	BLUE = 'blue',
	YELLOW = 'yellow',
	ORANGE = 'orange',
	PURPLE = 'purple',
	SKY = 'sky',
	EMERALD = 'emerald',
	AMBER = 'amber',
	VIOLET = 'violet',
}
```

If you want to run a custom function along side one of these buttons, you would need to use the property 'func', when clicking the button - this function would then run.

### Full configuration

A basic full configuration of the Card notification:

```typescript
await Card({
	title: 'Title',
	colour: NotificationColour.AMBER,
	buttons: ['Yes', 'Dismiss'],
	callback: (_resolve, _reject, notification) => {
		notification.setLoading(true);
		setTimeout(() => {
			notification.setLoading(false);
			return resolve(any);
		}, 5000);
	},
	configExtends: {
		Dismiss: {
			options: ['Dismiss'],
			colour: NotificationColour.RED,
			close: true,
			promise: {
				ACTION: 'Dismissed',
			},
		},
	},
});
```

By default you can provide buttons and a callback, but only either a button can resolve or the callback can.

For example, you can use the callback perform and async task and update the notification body, before showing the buttons e.g:

```typescript
(_resolve, _reject, notification) => {
	// Set the loading state to true!
    notification.setLoading(true);
	setTimeout(() => {

        // Set the body content to a newly created div!
        const div = document.createElement('div');
        div.innerHTML = "Test!";
        notification.setHTMLContent(div);

        // End the loader, show the content
		notification.setLoading(false);
		return resolve(any);
	}, 5000);
};
```

## Making a Toast notification:

```typescript
Toast({
	message: '✅ This is the body',
	colour, // Defualt NotificationColour.BLUE
	timeout, // Default 5s
	position, // Default NotificationPosition.LeftBottom
});
```

You can tell the notification where to position by using the position attribute, you don't have to supply either/or attributes but it will default to bottom left.
