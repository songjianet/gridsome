const path = require('path')
const fs = require('fs-extra')
const genIcons = require('./icons')
const genConfig = require('./config')
const genRoutes = require('./routes')
const genPlugins = require('./plugins')
const genConstants = require('./constants')

// TODO: let plugins add generated files

class Codegen {
  constructor (app) {
    this.app = app

    this.files = {
      'icons.js': genIcons,
      'config.js': genConfig,
      'routes.js': genRoutes,
      'constants.js': genConstants,
      'plugins-server.js': () => genPlugins(app, true),
      'plugins-client.js': () => genPlugins(app, false),
      'now.js': () => `export default ${app.store.lastUpdate}`
    }
  }

  async generate (filename = null, ...args) {
    const outDir = this.app.config.tmpDir

    const outputFile = async (filename, ...args) => {
      const filepath = path.join(outDir, filename)
      const content = await this.files[filename](this.app, ...args)

      if (await fs.exists(filepath)) {
        await fs.remove(filepath)
      }

      await fs.outputFile(filepath, content)
    }

    if (filename) {
      await outputFile(filename, ...args)
    } else {
      await fs.remove(outDir)

      for (const filename in this.files) {
        await outputFile(filename)
      }
    }
  }
}

module.exports = Codegen
