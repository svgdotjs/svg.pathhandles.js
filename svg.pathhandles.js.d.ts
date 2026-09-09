import { Path } from '@svgdotjs/svg.js'

declare module '@svgdotjs/svg.js' {
  interface Path {
    handles: {
      (value?: boolean | object): Path
      defaults: object
    }
  }
}