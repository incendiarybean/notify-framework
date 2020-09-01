# Notify Framework

Notify-Framework is an extremely lightweight NPM module for creating pop-up notifications.

This module uses TailwindCSS and Animate.css and must be installed alongside it.

## Installation

Use [NPM](https://www.npmjs.com/) to install it and the other 2 requirements with the below command:

```bash
npm install @incendiarybean/notify-framework tailwindcss animate.css --save
```

## Usage
Import the module:
```javascript
import { Notify } from '@incendiarybean/notify-framework';
```
# Making a large popup notification with buttons:
```javascript
let content = {
    title:"This is a title",
    body: "This is the body",
    colour: "blue",
    options: ["Dismiss"]
};

Notify(content, "max");

```
The max popup can be moved around the screen using the draggable feature of the module, though you may need to tweak your Tailwind config to allow active/grab cursor like below:
```javascript
module.exports = {
    theme: { 
        extend:{
            cursor: {
                grabbing: 'grabbing',
                grab: 'grab'
            },
        }
    },
    variants: {
        cursor: ['responsive', 'hover', 'focus', 'active'],
    },
}
```

You can also customise the buttons that appear on the notification through a JSON file, it will check the root directory for a notify.json file (or default to the predefined one). This file looks like:
```javascript
{
    "actions":{
        "Dismiss": {
            "options": ["Dismiss", "No", "Cancel"],
            "close": true,
            "resolve": true,
            "reload": false,
            "returnComment":{
                "ACTION":"Dismissed"
            },
            "colour": "red"
        },
    }
}
```
This is where you define what the button does, in options you can see the different variants of a dismiss button.

This dismiss button will close the window, resolve the promise, won't reload the page and the returned resolution of the promise is "ACTION": "Dismissed". The button is also red.

# Making a small slide from the side notification:
```javascript
let content = {
    title:"This is a title",
    body: "This is the body",
    colour: "blue",
    position: ["top", "left"]
};

Notify(content, "min");

```
You can tell the notification where to position by using the position attribute, you don't have to supply either/or attributes but it will default to bottom left.

## Upcoming!
I hope to update this with new notification styles and animation options and the ability to call your own custom functions during the notification response.

Will also make notifications stackable.