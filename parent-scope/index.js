/** Return all property names */
function getAllPropertyNames(obj) {
  let arr = []
  for (let key in obj) arr.push(key)
  return arr
}

/** Call original method and update automatically */
function hook(p, key) {
  let h = e => {
    // update only when the argument is an Event object
    if (e && e instanceof Event) {
      // suppress updating on the inherit tag
      e.preventUpdate = true
      // call original method
      p[key](e)
      // update automatically
      p.update()
    } else {
      p[key](e)
    }
  }
  h._inherited = true
  return h
}

export default {
  /**
   * Inject properties from parents
   */
  init: function() {
    //when the tag hasn't parent
    if(!this.parent){
      return
    }
    /** Store the keys originally belonging to the tag */
    this.one('update', () => {
      this._ownPropKeys = getAllPropertyNames(this)
      this._ownOptsKeys = getAllPropertyNames(this.opts)
    })
    /** Inherit the properties from parents on each update */
    this.on('update', () => {
      const ignoreProps = ['root', 'triggerDomEvent']
      getAllPropertyNames(this.parent)
        // TODO:
        //   Skipping 'triggerDomEvent' is a temporal workaround.
        //   In some cases function on the child would be overriden.
        //   This issue needs more study...
        .filter(key => !~this._ownPropKeys.concat(ignoreProps).indexOf(key))
        .forEach(key => {
          this[key] = typeof this.parent[key] != 'function' || this.parent[key]._inherited
            ? this.parent[key]
            : hook(this.parent, key)
        })
      getAllPropertyNames(this.parent.opts)
        .filter(key => !~this._ownOptsKeys.indexOf(key) && key != 'riotTag')
        .forEach(key => {
          this.opts[key] = typeof this.parent.opts[key] != 'function' || this.parent.opts[key]._inherited
            ? this.parent.opts[key]
            : hook(this.parent, key)
        })
    })
  }
}
