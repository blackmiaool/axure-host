const Koa = require("koa");
const app = new Koa();
const send = require("koa-send");
const koaBody = require("koa-body");
const Path = require("path");
const fs = require("fs-extra");
const Router = require("koa-router");
const router = new Router();
const xss = require("xss");
const db = require("./db.js");
// app.use(require('koa-static')("./static",{
//   gzip:true
// }));
// // response
// app.use(ctx => {
//   ctx.body = 'Hello Koa';
// });
app.use(koaBody({ multipart: true }));
app.use(router.routes()).use(router.allowedMethods());

// app.use(async ctx => {
//     const path = ctx.path;
//     if (path.startsWith("/home/serve")) {
//         await send(ctx, ctx.path.replace(/^\/home\/serve\//, "/"), {
//             root: __dirname + "/serve",
//             index: "index.html"
//         });
//     } else if (path.startsWith("/home/")) {
//         await send(ctx, ctx.path.replace(/^\/home\//, "/"), {
//             root: __dirname + "/public",
//             index: "index.html"
//         });
//     } else if (path.startsWith("/upload/")) {

//     } else if (path.startsWith("/api/list/")) {
//     }
// });
const apiRouter = new Router();
apiRouter
    .post("/create", async ctx => {
        let name = ctx.request.body.name;
        name = xss(name, {
            whiteList: {}
        });
        db.addProject({ name });
        ctx.body = "ok";
    })
    .post("/list", async ctx => {
        let name = ctx.request.body.name;
        name = xss(name, {
            whiteList: {}
        });
        const list = await db.getProjectList({ name });
        ctx.body = list;
    })
    .post("/delete", async ctx => {
        let id = ctx.request.body.id*1+"";
        fs.remove(Path.join(__dirname,"serve",id))
        await db.deleteProject(id);
        ctx.body = 'ok';
    });

router
    .redirect("/", "/home/")
    .get("/home/*", async ctx => {
        await send(ctx, ctx.path.replace(/^\/home\//, "/"), {
            root: __dirname + "/public",
            index: "index.html"
        });
    })
    .get("/serve/*", async ctx => {
        await send(ctx, ctx.path.replace(/^\/serve\//, "/"), {
            root: __dirname + "/serve",
            index: "index.html"
        });
    })
    .post("/upload", async ctx => {
        const config = ctx.request.body;
        const file = ctx.request.files.file;
        const reader = fs.createReadStream(file.path);
        const targetEndPath = file.name
            .split("/")
            .slice(1)
            .join("/");
        const split = targetEndPath.split("/");
        split.pop();
        let targetPath = Path.join(
            __dirname,
            "serve",
            config.id * 1 + "",
            split.join("/")
        );
        targetPath = targetPath.replace(/\.\./g, "");
        await fs.ensureDir(targetPath);
        const stream = fs.createWriteStream(
            Path.join(__dirname, "serve", config.id * 1 + "", targetEndPath)
        );
        reader.pipe(stream);
        
        ctx.body = "ok";
    })
    .use("/api", apiRouter.routes());

app.listen(9018);
