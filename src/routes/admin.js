const Router = require('koa-router')
const debug = require('debug')('app:routes:admin')

const db = require('../db')

// Every route in this router is only accessible to admins

const router = new Router()

// //////////////////////////////////////////////////////////
// Routes

// Show admin panel homepage
router.get('/admin', async ctx => {
  const jobs = await db.getJobs(0)
  await ctx.render('admin/index', {
    ctx,
    jobs,
  })
})

router.get('/jobs/approve/:id', async ctx => {
    ctx.validateParam('id')
    await db.approveJobById(ctx.vals.id)
    ctx.redirect('/admin')
})


router.post('/admin/companies/:id', async ctx => {
    ctx.validateParam('id')

    // Insert
    await db.updateCompany(ctx.vals.id, {
        name: ctx.request.body.name,
        url: ctx.request.body.url,
        year_founded: ctx.request.body.year_founded,
        revenue: ctx.request.body.revenue,
        avg_salaries: ctx.request.body.avg_salaries,
        tags: ctx.request.body.tags
    })

    ctx.redirect(`/companies`)
})

router.get('/admin/companies/:id', async ctx => {
    ctx.validateParam('id')
    const company = await db.getCompanyById(ctx.vals.id)
    ctx.assert(company, 404)
    await ctx.render('company_show', {
        ctx,
        company
    })
})

// //////////////////////////////////////////////////////////

module.exports = router
