const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
const bodyParser = require('koa-bodyparser');
const static = require('koa-static');
const multer = require('koa-multer')
const jwt = require('jwt-simple');

const app = new Koa();
const cors = require('koa2-cors');
const secret = 'zyl'

app.use(cors());
app.use(bodyParser());
app.use(static(path.resolve(__dirname, 'uploads')))

var storage = multer.diskStorage({
    // 文件保存路径
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    // 修改文件名称
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname.split('.')) //亿点分隔，可取到后缀名
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
})
// 加载配置
var upload = multer({
    storage: storage
})

// 分类
const category = require('./category');
router.get('/api/category', async ctx => {
    let categories = category.map(cat => ({
        text: cat.name,
        value: cat.id
    }));
    ctx.body = {
        code: 0,
        data: categories
    }
});

const sleep = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

const slides = require('./slides');
router.get('/api/slides', async ctx => {
    ctx.body = {
        code: 0,
        data: slides
    }
});

router.get('/api/lessonList/:id', async ctx => {
    let id = ctx.params.id;
    let { size, offset } = ctx.query;
    size = parseInt(size);
    offset = parseInt(offset)
    let item = category.find(c => c.id == id); // 查找对应的分类
    let result = []
    if (!item) {
        let list = category.reduce((memo, current) => {
            return memo.concat(current.children)
        }, []);
        result = list.slice(offset, offset + size);
    } else {
        result = item.children.slice(offset, offset + size);

    }
    ctx.body = {
        code: 0,
        data: {
            result,
            hasMore: result.length == size
        }
    }
})

let userList = [{
    username: 'admin',
    password: 'admin'
}]
let currentUrl = ''
let btnPermission = [1,3,5]
let menuList = [{
    name: '联系我',
    auth: 'contcat',
    path: '/contcat'
}
// ,{
//     name: '服务',
//     auth: 'service',
//     path: '/service'
// }
]
router.post('/api/login', async ctx => {
    // 登录接口
    let { username, password } = ctx.request.body
    let user = userList.find(user => user.username === username && user.password === password)
    if(user){
        let token = jwt.encode({
            username,
            btnPermission,
            menuList,
            url: currentUrl
        }, secret)
        ctx.body = {
            code: 0,
            data: {
                username,
                token,
                btnPermission,
                menuList,
                url: currentUrl
            }
        }
    } else {
        ctx.body = {
            code: 1,
            data: '登录失败，请检查账号密码'
        }
    }
}) 

router.get('/api/validate', async ctx => {
    let token = ctx.headers['token']
    if(!token){
        ctx.body = {
            code: 1,
            data: '用户未登录'
        }
    } else {
        try{
            let user = jwt.decode(token, secret)
            ctx.body = {
                code: 0,
                data: {
                    ...user,
                    btnPermission,
                    menuList,
                    token,
                    url: currentUrl
                }
            }
        } catch (e) {
             ctx.body = {
                code: 1,
                data: 'token不正确'
            }
        }
    }
})

// 详情
router.get('/api/detail/:id', async ctx => {
    let list = category.reduce((memo, current) => {
        return memo.concat(current.children)
    }, [])
    let item = list.find(item => item.id == ctx.params.id)

    if(item){
        ctx.body = {
            code: 0,
            data: item
        }
    } else {
        // 如果没有找到，说明没有
        ctx.body = {
            code: 1,
            data: '商品不存在'
        }
    }
})

router.post('/api/avatar', upload.single('file', async (ctx, next) => {
    currentUrl = 'http://localhost:3000/' + ctx.req.file.filename
    ctx.body = {
        code: 0,
        data: {
            url: 'http://localhost:3000/' + ctx.req.file.filename
        }
    }
}))

app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
