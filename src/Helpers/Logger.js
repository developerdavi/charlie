const figlet = require('figlet')
const chalk = require('chalk')

const Log = (text = '', big = false, options = ['white']) => {

  if (big) {
    console.log(
      chalk.red(figlet.textSync(text, {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      }))
    )
  } else {
    for (const option of options) {
      if (!chalk[option]) continue
      text = chalk[option](text)
    }
    text = chalk.bold(text)
    console.log(text)
  }

}

module.exports = Log