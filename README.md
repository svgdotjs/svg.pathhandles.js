# svg.pathhandles.js

A plugin for the [svgdotjs.github.io](https://svgdotjs.github.io/) library which adds handles to svg paths as known from svg programs like inkscape.

svg.pathhandles.js is licensed under the terms of the MIT License.

## Dependencies

This plugin requires svg.js >= v3.2.4 and [svg.draggable.js](https://github.com/svgdotjs/svg.draggable.js) >= v3.0.6. The handles are only draggable when the draggable plugin is loaded.

## Usage

Install the plugin together with its dependencies:

```sh
npm install @svgdotjs/svg.js @svgdotjs/svg.draggable.js @svgdotjs/svg.pathhandles.js
```

Include the plugins after including the svg.js library in your html document.

```html
<script src="node_modules/@svgdotjs/svg.js/dist/svg.js"></script>
<script src="node_modules/@svgdotjs/svg.draggable.js/dist/svg.draggable.js"></script>
<script src="node_modules/@svgdotjs/svg.pathhandles.js/dist/svg.pathhandles.js"></script>
```

Or for esm just require them:

```js
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'
import '@svgdotjs/svg.pathhandles.js'
```

Add handles to a path by calling `handles()` on the path element:

```javascript
const draw = SVG().addTo('#canvas').size(400, 400)
const path = draw.path('M0,0 C10,10 20,20 30,0')

path.handles()
```

The plugin creates a circle handle for every point of every cubic bezier (`C`) segment and lines from the segment points to the two control points. Dragging a handle updates the path accordingly.

## Options

Calling `handles()` with an options object merges it with `handles.defaults`:

```javascript
path.handles.defaults = {
  // your defaults
}

path.handles({
  // your options
})
```

## Remove

The handles can be removed by calling `handles()` again with `false`:

```javascript
path.handles(false)
```