const assert = require('better-assert')
const router = require('koa-router')()
const debug = require('debug')('app:routes:index')
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

const db = require('../db')
const pre = require('../presenters')
const mw = require('../middleware')
const config = require('../config')
const belt = require('../belt')
const paginate = require('../paginate')
const cache = require('../cache')

// //////////////////////////////////////////////////////////

function preLaunch() {
    return (ctx, next) => {
        if (!ctx.request.url.startsWith('/subscribe') && !ctx.request.url.startsWith('/login') && !ctx.request.url.startsWith('/companies') && !ctx.request.url.startsWith('/admin')) ctx.redirect('/companies')
        else next()
    }
}

// Useful route for quickly testing something in development
// 404s in production
router.get('/test', async ctx => {
  ctx.assert(config.NODE_ENV === 'development', 404)
})

router.get('/', preLaunch(), async ctx => {
  const jobs = await db.getJobs(1)
  //jobs.forEach(pre.presentJob)
  await ctx.render('homepage', {
    ctx,
    jobs
  })
})

router.get('/companies', async ctx => {
    const companies = await db.getCompanies()
    await ctx.render('companies', {
        ctx,
        companies
    })
})

router.get('/job/:job_id', async ctx => {
    ctx.validateParam('job_id')
    const job = await db.getJobById(ctx.vals.job_id)
    ctx.assert(job, 404)
    await ctx.render('job_show', {
        ctx,
        job
    })
})

router.get('/post', async ctx => {
    const companies = await db.getAllCompanies()
    companies.forEach(pre.presentCompanies)
    await ctx.render('job_post', {
      companies
    })
})

router.post('/subscribe', async ctx => {
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/contactdb/recipients',
        body: [{
            email: ctx.request.body.email,
            property: "remote-rush"
        }]
    });

    sg.API(request)
        .then(function (response) {
            ctx.body = response.body;
        })
        .catch(function (error) {
            ctx.body = error.response.body.errors;
        });

    ctx.status = 200;
})

router.post('/post', async ctx => {
    let companyId = 0;

    if (ctx.request.body.company_id == 'None') {
        companyId = await db.insertCompany({
            name: ctx.request.body.name,
            url: ctx.request.body.url
        })
    }

    // Insert
    await db.insertJob({
        company_id: companyId.id ? companyId.id : ctx.request.body.company_id,
        type: ctx.request.body.type,
        title: ctx.request.body.title,
        description: ctx.request.body.description,
        contact_email: ctx.request.body.contact_email,
        approved: 0
    })

    // RESPOND
    ctx.flash = { message: ['success', 'Job sent for approval'] }
    ctx.redirect(`/`)
})

// //////////////////////////////////////////////////////////

module.exports = router
