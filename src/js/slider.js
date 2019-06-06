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
    }

    // Set slider width
    document.querySelectorAll(`[${this.config.attr}]`).forEach(slider => {
      this.setSliderWidth(slider)
    })

    // Event listeners
    document.addEventListener('click', e => this.click(e))
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
    this.state.slider.style.left = `${this.state.index * -100}%`

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

    // Load slider state
    this.loadState(e.target)

    // Update state
    if (prevClick) this.state.index--
    else this.state.index++

    // Set state
    this.setState()
  }
}

/**
 * Slider configuration options
 * @typedef {Object} Options
 * @property {string} attr - Slider component attribute name
 * @property {OnSlide} onSlide - Called on each slide change
 * @property {string} slider - Selector for slider list element
 * @property {string} sliderContainer - Selector for slider outer container element
 */

/**
 * Slider component state
 * @typedef {Object} State
 * @property {number} index - Current slide index
 * @property {number} length - Slide count
 * @property {HTMLElement} slider - Parent slider list element
 * @property {HTMLElement} sliderContainer - Slider outer container element
 */

/**
 * onSlide callback function
 * @callback OnSlide
 * @param {State} state - New sortable state
 */
