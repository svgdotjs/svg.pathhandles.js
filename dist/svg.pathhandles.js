/*! svg.pathhandles.js - v0.0.1 - 2016-04-14
* https://github.com/Fuzzyma/svg.pathhandles.js
* Copyright (c) 2016 Ulrich-Matthias Schäfer; Licensed MIT */
(function(SVG, undefined){

  function PathSegmentHandle(pos, seg, handler, index){
    if(seg[0] !== 'C') return this

    this.cl1 = handler.parent.line(pos[0], pos[1], seg[1], seg[2]).stroke('#fff')
    this.cl2 = handler.parent.line(seg[3], seg[4], seg[5], seg[6]).stroke('#fff')

    this.cp1 = handler.parent.circle(10).center(seg[1], seg[2]).stroke('#fff').fill('none').draggable().style('pointer-events', 'all')
    this.cp2 = handler.parent.circle(10).center(seg[3], seg[4]).stroke('#fff').fill('none').draggable().style('pointer-events', 'all')

    if(index && handler.el.array().valueOf()[index-1][0] !== 'C'){
      this.p1 = handler.parent.circle(10).center(pos[0], pos[1]).stroke('#fff').fill('none').draggable().style('pointer-events', 'all')
    }

    this.p2 = handler.parent.circle(10).center(seg[5], seg[6]).stroke('#fff').fill('none').draggable().style('pointer-events', 'all')

    new SVG.Set([this.p1, this.cp1, this.cp2, this.p2]).on('dragmove._handles', function(){
      handler.update(
        index,
        this.p1 ? [ this.p1.cx(), this.p1.cy() ] : null,
        [ this.cp1.cx(), this.cp1.cy() ],
        [ this.cp2.cx(), this.cp2.cy() ],
        [ this.p2.cx(), this.p2.cy() ]
      )
    }, this)

  }

  PathSegmentHandle.prototype.redraw = function(pos, seg){
    if(seg[0] !== 'C') return this

    this.cl1.plot(pos[0], pos[1], seg[1], seg[2])
    this.cl2.plot(seg[3], seg[4], seg[5], seg[6])
  }

  function HandlesHandler(el) {
      this.el = el;
      this.parent = el.parent();
      el.remember('_handlesHandler', this);
      this.handles = []
  }

  HandlesHandler.prototype.init = function (value, options) {

      var i, len
  
      this.options = {};
      this.value = value

      // Merging the defaults and the options-object together
      for (i in this.el.handles.defaults) {
        this.options[i] = this.el.handles.defaults[i];
        if (options[i] !== undefined) {
          this.options[i] = options[i];
        }
      }

      // path array
      var arr = this.el.array().valueOf()
      var pos
      for(i = 0, len = arr.length; i < len; ++i){
        if(i){
          pos = [
            arr[i-1][arr[i-1].length-2],
            arr[i-1][arr[i-1].length-1]
          ]
        }

        this.handles.push(new PathSegmentHandle(pos, arr[i], this, i))
      }

      this.observe()
      //this.cleanup()

  }

  HandlesHandler.prototype.handler = function () {

    if(!this.value) return

    var arr = this.el.array().valueOf()

    this.handles.forEach(function(el, index){

      var pos

      if(index){
        pos = [
          arr[index-1][arr[index-1].length-2],
          arr[index-1][arr[index-1].length-1]
        ]
      }

      el.redraw(pos, arr[index])

    })

  }

  HandlesHandler.prototype.observe = function () {
    var _this = this;

    if (MutationObserver) {
      if (this.value) {
        this.observerInst = this.observerInst || new MutationObserver(function () {
          _this.handler()
        })
        this.observerInst.observe(this.el.node, {attributes: true})
      } else {
        try {
          this.observerInst.disconnect()
          delete this.observerInst
        } catch (e) {
        }
      }
    } else {
      this.el.off('DOMAttrModified.select')

      if (this.value) {
        this.el.on('DOMAttrModified.select', function () {
          _this.handler()
        })
      }
    }
  }

  HandlesHandler.prototype.update = function(index, p1, cp1, cp2, p2) {

    var arr = this.el.array().valueOf()
    
    if(index && p1){
      arr[index-1][arr[index-1].length-2] = p1[0]
      arr[index-1][arr[index-1].length-1] = p1[1]
    }
    
    arr[index][1] = cp1[0]
    arr[index][2] = cp1[1]
    arr[index][3] = cp2[0]
    arr[index][4] = cp2[1]
    arr[index][5] = p2[0]
    arr[index][6] = p2[1]

    this.el.plot(arr)

  }

  SVG.extend(SVG.Path, {

    handles: function(value, options){

      if(typeof value === 'object'){
        options = value
        value = true
      }

      var handlesHandler = this.remember('_handlesHandler') || new HandlesHandler(this)

      handlesHandler.init(value === undefined ? true : value, options || {})

      return this

    }

  })

  SVG.Element.prototype.selectize.defaults = {
    points: true,                            // If true, points at the edges are drawn. Needed for resize!
    classRect: 'svg_select_boundingRect',    // Css-class added to the rect
    classPoints: 'svg_select_points',        // Css-class added to the points
    radius: 7,                               // radius of the points
    rotationPoint: true,                     // If true, rotation point is drawn. Needed for rotation!
    deepSelect: false                        // If true, moving of single points is possible (only line, polyline, polyon)
  }

})(SVG)