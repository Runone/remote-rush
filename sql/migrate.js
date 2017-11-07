const path = require('path')
const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)

const config = require('../src/config')
const { pool } = require('../src/db/util')


// //////////////////////////////////////////////////////////

function slurpSql(filePath) {
    const relativePath = '../sql/' + filePath
    const fullPath = path.join(__dirname, relativePath)
    return readFile(fullPath, 'utf8')
}

async function migrate() {
    console.log('Migrating the database...')
    //@todo
}

migrate().then(
    () => {
        console.log('Finished migrating db')
        process.exit(0)
    },
    err => {
        console.error('Error:', err, err.stack)
        process.exit(1)
    }
)
