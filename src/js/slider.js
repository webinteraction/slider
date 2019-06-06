export class Slider {
  /**
   * Instantiate a new slider
   * @param {Options} options - Component configuration options
   * @return {Slider}
   */
  constructor (options) {
    /**
     * Slider component configuration
     * @type {Options}
     */
    this.config = Object.assign({
      attr: 'data-slider',
      onSlide: (state) => {},
      slider: '.slides',
      sliderContainer: '.slider',
      threshold: 20,
    }, options)

    // Initialize component
    this.init()

    return this
  }

  /**
   * Initialize component
   * @return {void}
   */
  init () {
    /**
     * Component state
     * @type {State}
     */
    this.state = {
      index: 0,
      length: 0,
      slider: null,
      sliderContainer: null,
      start: undefined,
      swiping: false,
      swipingDistance: 0,
      width: undefined,
    }

    // Set slider width
    document.querySelectorAll(`[${this.config.attr}]`).forEach(slider => {
      this.setSliderWidth(slider)
    })

    // Event listeners
    document.addEventListener('click', e => this.click(e))
    document.addEventListener('touchstart', e => this.touchStart(e))
    document.addEventListener('touchmove', e => this.touchMove(e))
    document.addEventListener('touchend', e => this.touchEnd(e))
    document.addEventListener('keydown', e => this.keydown(e))
  }

  /**
   * Update slider state
   * @return {void}
   */
  setState () {
    // No slider
    if (!this.state.slider) return

    // Clamp index
    if (this.state.index < 0) this.state.index = 0
    else if (this.state.index >= this.state.length) this.state.index = this.state.length - 1

    // Set left position of slider
    this.state.slider.style.left = `${(this.state.index * -100) + this.swipingDistancePercentage()}%`

    // Set classes
    this.state.slider.classList[this.state.swiping ? 'add' : 'remove']('swiping')

    // Fire onSlide event
    this.config.onSlide(this.state)
  }

  /**
   * Load slider state from given child Element
   * @param {HTMLElement} el - Element from which to begin traversal to find slider state
   * @return {void}
   */
  loadState (el) {
    // Find slider container
    this.state.sliderContainer = el.closest(this.config.sliderContainer)
    if (!this.state.sliderContainer) throw new Error('Slider container not found from element')

    // Find slider
    this.state.slider = this.state.sliderContainer.querySelector(this.config.slider)
    if (!this.state.slider) throw new Error('Slider not found in container')

    // Get slider length
    this.state.length = this.state.slider.childElementCount

    // Get current slider index
    this.state.index = this.getSlideIndex()

    // Measure slider width
    this.state.width = this.state.sliderContainer.getBoundingClientRect().width
  }

  /**
   * Get current slider slide index
   * @return {number}
   */
  getSlideIndex () {
    // Get left value
    let left = this.state.slider.style.left || '0%'
    left = parseInt(left.replace(/[%-]/g, ''))

    // Round to nearest index
    return Math.round(left / 100)
  }

  /**
   * Set width of slider based on child count
   * @param {HTMLElement} slider - Slider element
   * @return {void}
   */
  setSliderWidth (slider) {
    slider.style.width = `${slider.childElementCount * 100}%`
  }

  /**
   * Navigate slider forwards or backwards
   * @param {HTMLElement} el - Element from which to begin traversal
   * @param {boolean} forward - Navigate forward?
   */
  navigate (el, forward = true) {
    // Load slider state
    this.loadState(el)

    // Update state
    if (forward) this.state.index++
    else this.state.index--

    // Set state
    this.setState()
  }

  /**
   * Get swiping distance percent
   * @return {number}
   */
  swipingDistancePercentage () {
    return this.state.swipingDistance / this.state.width * 100
  }

  /**
   * Click listener
   * @param {MouseEvent} e - Click event
   */
  click (e) {
    // Determine click type
    const prevClick = e.target.matches(`[${this.config.attr}-prev], [${this.config.attr}-prev] *`)
    const nextClick = !prevClick && e.target.matches(`[${this.config.attr}-next], [${this.config.attr}-next] *`)

    // Not a [data-slider-*] click?
    if (!prevClick && !nextClick) return

    // Prevent default click
    e.preventDefault()

    // Navigate
    this.navigate(e.target, nextClick)
  }

  /**
   * Touchstart listener
   * @param {TouchEvent} e - Touchstart event
   */
  touchStart (e) {
    // Not a single touch
    if (e.touches.length !== 1) return

    // Not a [data-slider] touch
    if (!e.target.matches(`[${this.config.attr}], [${this.config.attr}] *`)) return

    // Load slider state
    this.loadState(e.target)

    // Record starting x position
    this.state.start = e.touches[0].screenX

    // Swiping
    this.state.swiping = true

    // Set state
    this.setState()
  }

  /**
   * Touchmove listener
   * @param {TouchEvent} e - Touchmove event
   */
  touchMove (e) {
    // Not a single touch
    if (e.touches.length !== 1) return

    // Not swiping
    if (!this.state.swiping) return

    // Update state
    this.state.swipingDistance = e.touches[0].screenX - this.state.start

    // Set state
    this.setState()
  }

  /**
   * Touchend listener
   * @param {TouchEvent} e - Touchend event
   */
  touchEnd (e) {
    // Swipe
    const distance = this.swipingDistancePercentage()
    if (distance <= this.config.threshold * -1) this.navigate(this.state.sliderContainer, true)
    else if (distance >= this.config.threshold) this.navigate(this.state.sliderContainer, false)

    // Update state
    this.state.swiping = false
    this.state.swipingDistance = 0

    // Set state
    this.setState()
  }

  /**
   * Keydown listener
   * @param {KeyboardEvent} e - Keydown event
   */
  keydown (e) {
    // Not focused in slider
    if (!e.target.matches(`[${this.config.attr}] *`)) return

    // Navigate slides on arrow left/right
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      this.navigate(e.target, e.key === 'ArrowRight')
    }
  }
}

/**
 * Slider configuration options
 * @typedef {Object} Options
 * @property {string} attr - Slider component attribute name
 * @property {OnSlide} onSlide - Called on each slide change
 * @property {string} slider - Selector for slider list element
 * @property {string} sliderContainer - Selector for slider outer container element
 * @property {number} threshold - Swiping threshold in percent width
 */

/**
 * Slider component state
 * @typedef {Object} State
 * @property {number} index - Current slide index
 * @property {number} length - Slide count
 * @property {HTMLElement} slider - Parent slider list element
 * @property {HTMLElement} sliderContainer - Slider outer container element
 * @property {number} start - Starting touch x-axis screen position
 * @property {boolean} swiping - Currently swiping slider?
 * @property {number} swipingDistance - Current x-axis pixel distance in screen space from touch start
 * @property {number} width - Pixel width of the slider component
 */

/**
 * onSlide callback function
 * @callback OnSlide
 * @param {State} state - New sortable state
 */
