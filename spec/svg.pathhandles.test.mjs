import { test } from 'node:test'
import assert from 'node:assert/strict'

import window from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'
import '../src/svg.pathhandles.js'

registerWindow(window, window.document)

function createPath() {
  const canvas = SVG()
  return canvas.path('M0,0 C10,10 20,20 30,0')
}

test('handles() creates handle elements for cubic segments', () => {
  const path = createPath()
  const canvas = path.parent()

  path.handles()

  // path + 2 lines + 4 circles (cp1, cp2, p1, p2)
  assert.equal(canvas.children().length, 7)

  const lines = canvas.children().filter((el) => el.type === 'line')
  const circles = canvas.children().filter((el) => el.type === 'circle')

  assert.equal(lines.length, 2)
  assert.equal(circles.length, 4)

  // handles are draggable and clickable
  circles.forEach((circle) => {
    assert.ok(circle.remember('_draggable'), 'circle has a drag handler')
    assert.equal(circle.attr('pointer-events'), 'all')
  })

  // lines connect the segment points with the control points
  const cl1 = Array.from(lines[0].array(), (p) => p.map(Number))
  const cl2 = Array.from(lines[1].array(), (p) => p.map(Number))
  assert.deepEqual(
    cl1.map((point) => point.map(Number)),
    [
      [0, 0],
      [10, 10],
    ],
  )
  assert.deepEqual(
    cl2.map((point) => point.map(Number)),
    [
      [20, 20],
      [30, 0],
    ],
  )
})

test('dragging a handle updates the path', () => {
  const path = createPath()
  const canvas = path.parent()

  path.handles()

  // circles are created after the path and the two lines
  const [cp1] = canvas.children().filter((el) => el.type === 'circle')
  cp1.center(50, 40)

  cp1.dispatch('dragmove', { event: {}, handler: cp1.remember('_draggable') })

  const arr = path.array()
  assert.equal(arr[1][1], 50)
  assert.equal(arr[1][2], 40)
  assert.equal(arr[1][3], 20)
  assert.equal(arr[1][4], 20)
  assert.equal(arr[1][5], 30)
  assert.equal(arr[1][6], 0)
})

test('handles(false) removes the handle elements', () => {
  const path = createPath()
  const canvas = path.parent()

  path.handles()
  assert.equal(canvas.children().length, 7)

  path.handles(false)
  assert.equal(canvas.children().length, 1)

  // handles can be re-enabled
  path.handles()
  assert.equal(canvas.children().length, 7)
})

test('handles.defaults and options are merged', () => {
  const path = createPath()

  assert.ok(typeof path.handles.defaults === 'object')

  path.handles.defaults.test = 'default'
  try {
    path.handles({ test: 'option' })
    const handler = path.remember('_handlesHandler')
    assert.equal(handler.options.test, 'option')
  } finally {
    delete path.handles.defaults.test
    path.handles(false)
  }
})