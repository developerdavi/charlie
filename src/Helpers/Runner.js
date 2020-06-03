const chalk = require('chalk')
const moment = require('moment')

const log = require('./Logger')

class Runner {
  
  /**
   * Used for creating a new Runner object
   * @param {Object} config The settings
   * @param {String} config.name The task name
   * @param {Function} config.task The task function
   * @param {Number} config.delay The delay (in miliseconds)
   * @param {Boolean} config.shouldStartNow Set as true if wanted to start immediately
   * @param {Boolean} config.logs If the task runner should log every execution
   */
  constructor(config = { name: '', task: () => new Promise, delay: 10000, shouldStartNow: false, logs: true }) {
    this.enabled = false

    this.task = config.task
    this.delay = config.delay
    this.name = config.name
    this.logs = config.logs
    
    if (config.shouldStartNow) {
      this.start()
    }
  }

  async start() {
    this.enabled = true
    return this.execute()
  }

  async enable() {
    this.enabled = true
  }

  async disable() {
    this.enabled = false
  }

  async execute() {
    const enabled = this.enabled

    if (this.logs) {
      log('=========================================================', false, ['blueBright'])
      log(`Running task:\t${this.name ? this.name : this.setting}`, false, ['blueBright'])
      log(`Task enabled:\t${enabled ? chalk.green('true') : chalk.red('false')}`, false, ['blueBright'])
      log(`Started at:  \t${chalk.yellow(moment().format('YYYY-MM-DD [at] HH:mm:ss'))}`, false, ['blueBright'])
    }

    if (!enabled) return setTimeout(this.execute.bind(this), this.delay)

    const runAgain = () => {
      setTimeout(this.execute.bind(this), this.delay)
    }

    try {
      await this.task()
      runAgain()
    } catch (e) {
      log('[ ERROR ]', true)
      log(e.message)
      runAgain()
    }

  }
}

module.exports = Runner