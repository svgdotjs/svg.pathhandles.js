import { Path, extend } from '@svgdotjs/svg.js'

// A set of handles for a single cubic bezier segment:
// two lines from the segment start/end point to the two control points
// and one draggable circle for every point of the segment
class PathSegmentHandle {
  constructor(pos, seg, handler, index) {
    if (seg[0] !== 'C') return this

    this.cl1 = handler.parent
      .line(pos[0], pos[1], seg[1], seg[2])
      .stroke('#fff')
    this.cl2 = handler.parent
      .line(seg[3], seg[4], seg[5], seg[6])
      .stroke('#fff')

    this.cp1 = handler.parent
      .circle(10)
      .center(seg[1], seg[2])
      .stroke('#fff')
      .fill('none')
      .draggable()
      .attr('pointer-events', 'all')
    this.cp2 = handler.parent
      .circle(10)
      .center(seg[3], seg[4])
      .stroke('#fff')
      .fill('none')
      .draggable()
      .attr('pointer-events', 'all')

    // the start point of the segment is only needed when it is not
    // already the end point of a previous cubic bezier segment
    if (index && handler.el.array()[index - 1][0] !== 'C') {
      this.p1 = handler.parent
        .circle(10)
        .center(pos[0], pos[1])
        .stroke('#fff')
        .fill('none')
        .draggable()
        .attr('pointer-events', 'all')
    }

    this.p2 = handler.parent
      .circle(10)
      .center(seg[5], seg[6])
      .stroke('#fff')
      .fill('none')
      .draggable()
      .attr('pointer-events', 'all')

    // move the path when a handle is dragged
    ;[this.p1, this.cp1, this.cp2, this.p2].forEach((el) => {
      if (el) {
        el.on('dragmove._handles', () => {
          handler.update(
            index,
            this.p1 ? [this.p1.cx(), this.p1.cy()] : null,
            [this.cp1.cx(), this.cp1.cy()],
            [this.cp2.cx(), this.cp2.cy()],
            [this.p2.cx(), this.p2.cy()],
          )
        })
      }
    })
  }

  // redraw the lines when the path changed externally
  redraw(pos, seg) {
    if (seg[0] !== 'C') return this

    this.cl1.plot(pos[0], pos[1], seg[1], seg[2])
    this.cl2.plot(seg[3], seg[4], seg[5], seg[6])
  }

  // remove all handle elements from the parent
  remove() {
    ;[this.p1, this.cp1, this.cp2, this.p2, this.cl1, this.cl2].forEach(
      (el) => {
        if (el) el.remove()
      },
    )
  }
}

// Creates the handles for every segment of a path and keeps them
// in sync with the path
class HandlesHandler {
  constructor(el) {
    this.el = el
    this.parent = el.parent()
    this.handles = []
    this.options = {}
    el.remember('_handlesHandler', this)
  }

  init(value, options = {}) {
    this.value = value

    // merge the defaults and the options-object together
    this.options = {}
    for (const key in this.el.handles.defaults) {
      this.options[key] = this.el.handles.defaults[key]
      if (options[key] !== undefined) {
        this.options[key] = options[key]
      }
    }

    // remove previously created handles
    this.cleanup()

    if (!this.value) return this

    const arr = this.el.array()
    for (let i = 0, len = arr.length; i < len; ++i) {
      const pos = i
        ? [arr[i - 1][arr[i - 1].length - 2], arr[i - 1][arr[i - 1].length - 1]]
        : undefined
      this.handles.push(new PathSegmentHandle(pos, arr[i], this, i))
    }

    this.observe()

    return this
  }

  // remove all handle elements and stop observing
  cleanup() {
    this.handles.forEach((handle) => handle.remove())
    this.handles = []
    this.stopObserving()
  }

  // redraw all handles after the path changed externally
  handler() {
    if (!this.value) return

    const arr = this.el.array()
    this.handles.forEach((handle, index) => {
      const pos = index
        ? [
            arr[index - 1][arr[index - 1].length - 2],
            arr[index - 1][arr[index - 1].length - 1],
          ]
        : undefined
      handle.redraw(pos, arr[index])
    })
  }

  // observe attribute changes on the path and redraw the handles
  observe() {
    if (typeof MutationObserver !== 'undefined') {
      this.observerInst =
        this.observerInst || new MutationObserver(() => this.handler())
      this.observerInst.observe(this.el.node, { attributes: true })
    } else {
      this.el.on('DOMAttrModified._handles', () => this.handler())
    }
  }

  stopObserving() {
    if (this.observerInst) {
      try {
        this.observerInst.disconnect()
        delete this.observerInst
      } catch (e) {
        //
      }
    } else {
      this.el.off('DOMAttrModified._handles')
    }
  }

  // update the path when a handle was dragged
  update(index, p1, cp1, cp2, p2) {
    const arr = this.el.array()

    if (index && p1) {
      arr[index - 1][arr[index - 1].length - 2] = p1[0]
      arr[index - 1][arr[index - 1].length - 1] = p1[1]
    }

    arr[index][1] = cp1[0]
    arr[index][2] = cp1[1]
    arr[index][3] = cp2[0]
    arr[index][4] = cp2[1]
    arr[index][5] = p2[0]
    arr[index][6] = p2[1]

    this.el.plot(arr)
  }
}

extend(Path, {
  handles(value, options) {
    if (typeof value === 'object') {
      options = value
      value = true
    }

    const handlesHandler =
      this.remember('_handlesHandler') || new HandlesHandler(this)

    handlesHandler.init(value === undefined ? true : value, options || {})

    return this
  },
})

Path.prototype.handles.defaults = {}
