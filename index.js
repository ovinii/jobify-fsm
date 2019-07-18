const express = require('express')
const app = express()
const sqlite = require('sqlite')
const bodyParser = require('body-parser')

const path = require('path')
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(req, res) => {
    const db = await dbConnection
    const categoriasDb = await db.all('SELECT * FROM CATEGORIAS;')
    const vagas = await db.all('SELECT * FROM VAGAS;') //db.all retorna um ou mais registros
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.CATEGORIA === cat.ID)
        }
    })
    
    res.render('home', {
        categorias
    })
})

app.get('/vaga/:id', async(req, res) => {
    const db = await dbConnection
    const vaga = await db.get('SELECT * FROM VAGAS WHERE ID = ' + req.params.id) //db.get retorna apenas um registro
    res.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/admin-panel')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('SELECT * FROM VAGAS;')

    res.render('admin/vagas', { vagas })
})

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM VAGAS WHERE ID = ' + req.params.id)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM CATEGORIAS;')
    res.render('admin/nova-vaga', { categorias })
})

app.post('/admin/vagas/nova', async(req, res) => {
    const { titulo, descricao, categoria } = req.body
    const db = await dbConnection
    await db.run(`INSERT INTO VAGAS (CATEGORIA, TITULO, DESC) VALUES ('${categoria}', '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas');
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM CATEGORIAS;')
    const vaga = await db.get('SELECT * FROM VAGAS WHERE ID = ' + req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { titulo, descricao, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`UPDATE VAGAS SET CATEGORIA = '${categoria}', TITULO = '${titulo}', DESC = '${descricao}' where ID = '${id}'`)
    res.redirect('/admin/vagas');
})

const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite', { Promise }))

const init = async() => {
    const db = await dbConnection
    await db.run('CREATE TABLE IF NOT EXISTS CATEGORIAS (ID INTEGER PRIMARY KEY, CATEGORIA TEXT);')
    await db.run('CREATE TABLE IF NOT EXISTS VAGAS (ID INTEGER PRIMARY KEY, CATEGORIA INTEGER, TITULO TEXT, DESC TEXT);')
    //const categoria = 'Marketing team'
    //await db.run(`INSERT INTO CATEGORIAS(CATEGORIA) VALUES ('${categoria}')
    //`)
    //const vaga = 'Marketing Digital (San Francisco)'
    //const descricao = 'Marketing Digital (San Francisco)'
    //await db.run(`INSERT INTO VAGAS (CATEGORIA, TITULO, DESC) VALUES (2, '${vaga}', '${descricao}')`)
}

init()
// teste comment

app.listen(port, (err) => {
    if(err) {
        console.log('ERROR!: Servidor não iniciado.')
    }
    console.log('Servidor iniciado.')
})