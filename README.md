## Webpack配置

### 简述

**说明：**从0开始配置一套 react + typescript 的 webpack 配置（本次使用webpack5版本）

**参考：**[配置webpack（上）](https://juejin.cn/post/6860129883398668296)、[配置webpack（下）](https://juejin.cn/post/6860134655568871437)

**补充：**为了消除版本不同可能的产生的bug，在下文中下载第三包时补充了此项目所用的版本信息，不意味着一定要使用该版本

**特色：**主要以实现核心功能为主



----

### 初始化项目

#### 项目基本架构

**生成项目依赖文件 package.json**

```
yarn init -y
```

**添加 .gitignore**

可以使用 vscode 插件 `gitignore` 快捷自定义添加，也可以直接使用 react 脚手架中的配置，也够用

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**项目基础架构**

先在项目根目录下创建三个主要文件夹： 

- `public`：用于存放项目的静态资源
- `scripts` ：用于存放 webpack 的配置文件
- `src` ：用于存放项目的代码文件

为了区分开 webpack 的开发和生产环境，因此需要两套配置文件，这两套配置有很多地方是共通的，为了代码优雅，可以使用第三方包 `webpack-merge` 来将公共配置分别导入两套文件，因此需要在 `scripts` 目录下创建三个文件：

- `webpack.common.js`：用于编写公共配置
- `webpack.dev.js`：用于编写开发环境配置
- `webpack.prod.js`：用于编写生产环境配置

**区分环境**

虽然都分开了配置，但是在公共配置中，还是可能会出现某个配置的某个选项在开发环境和生产环境中采用不同的配置，这个时候有两种选择：

- 分别在 dev 和 prod 配置文件中写一遍，common 中就不写了
- 设置某个环境变量，根据这个环境变量来判别不同环境

为了代码优雅性选择第二种方案，下载所需第三方包：

> `cross-env` ：统一配置Node环境变量

```
yarn add cross-env@7.03
```

> 不同操作系统设置环境变量的方式不一定相同，cross-env可以将其统一，比如Mac 电脑上使用 export NODE_ENV=development，而Windows 电脑上使用的是 set NODE_ENV=development

在 `scripts/config` 目录下新建 `env.js` 文件用于管理启动环境

> 在node中，全局变量 process 表示的是当前的node进程，process.env 包含着关于系统环境的信息，NODE_ENV 是用户一个自定义的变量，该变量会在下面配置启动命令时配上，这里先写上

```js
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  isDevelopment,
  isProduction,
}
```

**管理公共常量**

在 `scripts` 目录下新建 `constant.js` 文件，用于统一管理公共常量

首先先写公共项目根路径和启动端口及IP

```js
// scripts/constant.js

const path = require('path')

const PROJECT_PATH = path.resolve(__dirname, '../')   // 项目根路径

const SERVER_HOST = '127.0.0.1'
const SERVER_PORT = 3000

export {
  PROJECT_PATH,
  SERVER_HOST,
  SERVER_PORT,
}
```

webpack 配置的路径一般要求绝对路径写法，所以项目中往往会如下这样配置，可读性不佳

```js
module.exports = {
  entry: {
    app: path.resolve(__dirname, '../../src/index.js')
  },
  ...
}
```

使用配置的常量则可以如下配置

```js
module.exports = {
  entry: {
     app: path.resolve(PROJECT_PATH, './src/index.tsx'),       
  },
  ...
}
```

------

#### webpack配置

**webpack基本配置**

下载基本 webpack 配置所需第三方包：

> `webpack`：用于编译 JavaScript 模块
>
> `webpack-cli`：用于在命令行中运行 webpack
>
> `webpack-dev-serve`：可以在本地起一个 http 服务，通过简单的配置还可指定其端口、热更新的开启等
>
> `webpack-merge`：用于合并webpack公共配置
>
> `html-webpack-plugin`：用于打包html文件

```
yarn add webpack@5.28.0
yarn add webpack-cli@4.5.0
yarn add webpack-dev-server@3.11.2
yarn add webpack-merge@5.7.3
yarn add html-webpack-plugin@5.3.1
```

添加 html 模板文件和 webpack 入口文件，入口文件随便写点内容用于阶段测试

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="viewport" content="webpack5">
  <title>Webpack Config</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

```js
// src/index.js
const ele = document.querySelector('#root')
ele.innerHTML = '阶段测试'
```

添加启动项目配置

```js
// package.json
"scripts": {
    "start": "cross-env NODE_ENV=development webpack-dev-server --config ./scripts/config/webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config ./scripts/config/webpack.prod.js"
},
```

首先配置公共配置，然后分别引入开发、生产环境配置文件，很多配置直接使用默认即可，无需另外声明[【具体配置参考】](https://npmjs.com/package/html-webpack-plugin)

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { PROJECT_PATH } = require('../constant')

module.exports = {
  entry: {
    app: path.resolve(PROJECT_PATH, './src/index.js')
  },
  plugins: [
  	new HtmlWebpackPlugin({
      template: path.resolve(PROJECT_PATH, './public/index.html'),
    }),
  ]
}
```

配置开发环境，引入公共配置并且添加 [webpack-dev-server的配置](https://www.webpackjs.com/configuration/dev-server/)

```js
const { merge } = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

const common = require('./webpack.common')
const { PROJECT_PATH, SERVER_HOST, SERVER_PORT } = require('../constant')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'js/[name].js',
    path: path.resolve(PROJECT_PATH, './dist')
  },
  devServer: {
    host: SERVER_HOST,
    port: SERVER_PORT,
    stats: 'errors-only',         
    clientLogLevel: 'none',     
    compress: true,               
    open: true,                   
    hot: true,           
    noInfo: true,         
  },
  plugins: [
    // 实际上只开启 hot：true 就会自动识别有无声明该插件，没有则自动引入，但是怕有隐藏问题这里还是手动加上了
    new webpack.HotModuleReplacementPlugin()
  ]
})
```

> devtool：启动 source- map 的模式，如果代码发生错误则在浏览器上映射到对应错误地方，[【配置说明及参考】](https://doc.codingdict.com/webpack-cn-doc/configuration/devtool/)

> devServer的配置功能如下：
>
> - host：服务ip
>
> - port：服务端口
>
> - stats：设为errors-only表示终端只打印错误类型的日志，不会打印warning以及其他信息影响阅读
>
> - compress：设为true表示启用gzip压缩，加快网站打开速度
>
> - open：设为true表示第一次启动项目时自动打开默认浏览器
>
> - hot：设为true表示启用服务热替换配置
>
> - clientLogLevel：设为none表示去除多余网页console信息
>
> - noInfo：设为true表示去除启动项目时显示的打包信息

```
hot开启的是热替换而非热更新，webpack默认支持热更新
热更新：当文件有修改时，刷新浏览器页面
热替换：当文件有修改时，不刷新浏览器页面
什么时候使用热替换：更改css和局部js变动时导致整个页面刷新调试体验差，开启热替换后不会导致页面刷新也能更改页面数据，调试更快
```

为了实现js的热替换，此时需要在入口文件的执行代码最开始处配置一下 `module.hot.accept` 逻辑（css不需要配置，因为之后要配置的 `css-loader` 已经实现了这块逻辑）

```js
// src/index.js

if (module && module.hot) {
  module.hot.accept();
}
...
```

之后项目会适配 `typescript`，届时上述代码会报错：`类型NodeModule上不存在属性hot`，为了避免后续回来更改问题，这里只需下个第三方包就可以解决问题

> `@types/webpack-env`：包含 webpack 的 api 声明文件

```
yarn add @types/webpack-env@1.16.0
```

clientLogLevel开启前后效果图：开启后浏览器中只打印 `HMR` 的信息，去除了 `WDS` 的两条信息，防止浏览器过多打印无用信息

<img src="https://img-blog.csdnimg.cn/20210422220737938.png" style="margin:0">

noInfo开启前后效果图：开启后在终端少了很多打包信息

<img src="https://img-blog.csdnimg.cn/20210422221327636.png" style="margin:0">

<img src="https://img-blog.csdnimg.cn/20210422221422947.png" style="margin:0">

虽然少了打包消息，但是打包进度却消失了，不利于开发体验，因此使用第三方包来展示打包进度条

> `webpackbar`：用于显示打包进度条

```
yarn add webpackbar@5.0.0-3
```

```js
// scripts/config/webpack.common.js
const WebpackBar = require('webpackbar')

module.exports = {
  plugins: [
    ...
    new WebpackBar({
      name: 'Link Startou!!!', 
      color: '#52c41a' 
    }),
  ]
}
```

配置生产环境，同样引入公共配置，生产环境一般输出文件都会加上哈希值，而开发环境不需要，开发环境使用 `webpack-dev-server` 启动时不会在项目中真正的产生文件，而是存在了内存中

```js
// scripts/config/webpack.prod.js
const { merge } = require('webpack-merge')
const path = require('path')

const common = require('./webpack.common')
const { PROJECT_PATH } = require('../constant')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    filename: 'js/[name].[contenthash:8].js',
    path: path.resolve(PROJECT_PATH, './dist')
  },
})
```

>哈希值的区别：
>
>hash：每次修改任何一个文件，所有文件名的hash至都将改变，所以一旦修改了任何一个文件，整个项目的文件缓存都将失效
>
>chunkHash：根据chunk生成的hash值，如果打包来源于同一个chunk，那么hash值就一样，chunkHash不适用于同一chunk的文件，如一个js文件导入了一个css文件，他们属于同一个chunk，因此若只修改了js，最终打包出来的文件cs和js都会变成一个新的hash
>
>contenthash：根据文件内容生成hash值，不同文件的hash值一定不一样（只要文件内容不做修改，一定是同一个hash，有变动则会替换成另外的），这样就令浏览器只清楚掉变动文件的缓存（只有改动的文件重命名了）

**阶段测试**

在每一小阶段最后进行一次测试，确保添加配置时保证上一版本稳定

启动 `yarn start` 和 `yarn build`，如果 webpack 正常工作，则表示基本配置已完成



-----

### 配置CSS

先配置 css 而非 js 的原因是此时的 webpack 已经支持了原生 js 和 html 的打包，要想体验到完整功能应该先配置 css

#### 支持css导入

下载所需第三方包：

> `style-loader`：将 js 文件中引入的 css 代码插入到 html 模板文件，使网页可以正常展示样式
>
> `mini-css-extract-plugin`：和 `style-loader` 功能一样，只是打包后会单独生成 css 文件而非直接写在 html 文件中，用于生产环境，开发环境不需要另外生成文件使用 `style-loader` 即可
>
> `css-loader`：令 js 可以通过 `import` 或者 `require` 等命令导入 css 代码

```
yarn add style-loader@2.0.0
yarn add css-loader@5.2.4
yarn add mini-css-extract-plugin@1.4.0
```

```js
// scripts/config/webpack.common.js

// 因为后续要配sass和less也需要使用到这套规则，所以这里抽离出来
const getCssLoaders = () => [
  isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, 
  {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: "[local]--[hash:base64:5]"
      },
      sourceMap: isDevelopment,
    }
  }
]

module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [...getCssLoaders()]
      }
    ]
  },
}
```

>css-loader的options配置：
>
>- modules：开启 `css module`，看个人习惯，如果不使用可以直接置值 false，否则影响打包速度，`localIdentName` 表示自定义类名，为了确保类名全局统一加上哈希值
>- sourceMap：为 true 时会根据 `devtool` 映射css错误，生产环境不需要映射所有这里给的值是开发环境

在生产环境添加一下 `mini-css-extract-plugin` 规则

```js
// scripts/config/webpack.prod.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


module.exports = merge(common, {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
  ]
})
```

-----

#### 兼容样式

css的一些样式在不同浏览器内核中有不同的前缀写法，为了编写一套css打包时自动添加上所有的前缀，需要对webpack进行配置，下载第三方包：

> `postcss-loader`：与 sass/less 不同，不是预处理器，相当于一个工具箱，可以使用它配合插件去转换css
>
> `postcss-preset-env`：将最新的 css 语法转换为目标环境的浏览器能够理解的语法，不用考虑浏览器兼容问题，以前需要配合 autoprefixer 第三方包自动补全前缀，现在新版本已经内置autoprefixer功能了

```
yarn add postcss-loader@5.2.0
yarn add postcss-preset-env@6.7.0
```

改写 `scripts/config/webpack.common.js`  中的打包css规则函数

```js
const getCssLoaders = () => {
  const cssLoaders = [
    isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, 
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: "[local]--[hash:base64:5]"
        },
        sourceMap: isDevelopment,
      }
    }
  ]
  
  // 开发环境一般用chrom不会有问题，防止开发环境下看样式有一堆前缀影响查看，因此只在生产环境使用
  isProduction && cssLoaders.push({
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          isProduction && [
            'postcss-preset-env',
            {
              autoprefixer: {
                grid: true
              }
            }
          ]
        ]
      }
    }
  })
  
  return cssLoaders
}
```

这里需要注意的是 `postcss-loader` 处理的是 css，之后要配置的 `sass-loader` 和 `less-loader` 是将预处理器转换成 css 代码，因此它们的执行顺序都要在 `postcss-loader` 前

> postcss-preset-env的配置：
>
> - autoprefixer：开启自动添加前缀功能，有些功能是默认关闭的，如栅格样式一些浏览器不支持所以默认关闭了，这里手动打开

为了实现功能，还需要在 `package.json` 文件中配置 `browserslist` 属性

```json
{
    "browserslist": [
        ">0.2%",
        "not dead",
        "ie >= 9",
        "not op_mini all"
    ],
}  
```

> \>0.2%：兼容98%以上的主流浏览器
>
> not dead：不去兼容已经停用的浏览器
>
> ie >= 9：只兼容ie的9以上版本
>
> not op_mini all：不去兼容任何opera mini浏览器（主要原因已经停止更新很久并不再使用）

注意，这里有个天坑：配置 `browserslist` 字段会导致 `webpack-dev-server` 的热更新功能直接失效，为了避免这种情况需要给 webpack 配上 `target` 属性

```js
// scripts/config/webpack.dev.js

module.exports = merge(common, {
	// ...other
    target: 'web',
})
```

```js
// scripts/config/webpack.prod.js

module.exports = merge(common, {
	// ...other
    target: 'browserslist',
})
```



-----

#### 预处理器

下载所需第三方包：

> `less`：为 less-loader 提供依赖
>
> `less-loader`：将 less 代码转换为 css 代码
>
> `node-sass`：为 sass-loader 提供依赖
>
> `sass-loader`：将 sass 代码转换为 css 代码

```
yarn add less@4.1.1
yarn add less-loader@8.1.1
yarn add node-sass@5.0.0
yarn add sass-loader@11.0.1
```

> `node-sass` 下载成功与否完全看脸，如果失败可以尝试 `cnpm` 下载，或者直接在 `package.json` 中直接添加上 `"node-sass":"^5.0.0"` 锁定版本，然后再 `yarn install`

在 `scripts/config/webpack.common.js` 中配置 less 和 sass

```js
module: {
    rules: [
      {
        test: /\.css$/,
        use: [...getCssLoaders()]
      },
      {
        test: /\.less$/,
        use: [
          ...getCssLoaders(),
          {
            loader: 'less-loader',
            options: {
              sourceMap: isDevelopment,
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment,
            }
          }
        ]
      },
    ]
  },
  ...
}
```

----

#### 优化

##### 压缩css

下载所需第三方包：

> `css-minimizer-webpack-plugin`：压缩生产环境打包后的 css 文件

```
yarn add css-minimizer-webpack-plugin@2.0.0
```

```js
// scripts/config/webpack.prod.js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = merge(common, {
  // ...other
  optimization: {
    minimize: true,
    minimizer:[
      new CssMinimizerPlugin()
    ]
  }
})
```

> optimization：在 webpack4 之后添加了 `optimization` 属性，专门用于存放优化打包的配置，minimizer属性存放一个数组，里可以存放用于代码压缩的插件，minimize 置 true 表示启用 minimizer 配置

**阶段测试**

测试 css 是否可以功能正常打包

```js
// src/index.js
import style from './index.scss'

const ele = document.querySelector('#root')

const newEle = document.createElement("div")
newEle.className = style.ele
newEle.innerHTML = '测试css module'
ele.appendChild(newEle)
```

```scss
// src/index.scss
.ele {
  background-color: bisque;
  display: flex;
}
```

检查点：

- scss 样式是否正常
- css module 是否可以正常使用
- build 之后的生成的样式文件 flex 是否有兼容前缀



-----

### 配置JS

#### 兼容 ES6+

下载所需第三方包：

> `babel-loader`：用于处理 ES6+ 语法，将其编译为浏览器可以执行的 js
>
> `@babel/core`：babel 所需依赖
>
> `@babel/preset-env`：是一组ES6转译的plugins，会根据设置的目标浏览器环境（browserslist），选择该环境不支持的新特性进行转译，这样就减少了不必要转译，增快打包速度
>
> `@babel/plugin-transform-runtime`：提供 ES6+  的 api，如 es6 新的数组方法等，和 @babel/polyfill 不同的是该包可以实现按需加载，不会全部引入影响打包速度，需要依赖 runtime-corejs [【源码解析】](https://www.jianshu.com/p/50e8a508ccc4)
>
> `@babel/runtime-corejs3`：相当于 `@babel/polyfill` 的功能，在 7.4.0 版本后的 babel 使用 runtime-core 代替了 babel/polyfill

> Babel默认只转换新的 js 语法，而不转换新的API，如 `Iterator、Generator、Set、Maps、Proxy、 Reflect、Symbol、Promise` 等全局对象，以及一些在全局对象上的方法如 `Object.assign`都不会转码（如ES6在 Array 对象上新增了 `Array.form` 方法，Babel就不会转码这个方法，如果想让这个方法运行，必须使用`babel-polyfill` 、`babel-runtime` 、`plugin-transform-runtime` 等插件来转换）

<img src="https://img-blog.csdnimg.cn/20210426005334535.png" style="margin:0">

```
yarn add babel-loader@8.2.2
yarn add @babel/core@7.13.16
yarn add @babel/preset-env@7.13.15
yarn add @babel/plugin-transform-runtime@7.13.15
yarn add @babel/runtime-corejs3@7.13.17
```

Babel 在执行编译的过程中，会从项目的根目录下的 `.babelrc` 文件中读取配置（本质上是json格式文件），因此此时需要在项目根目录新建该文件，[【.babelrc配置说明及参考】](https://www.cnblogs.com/tugenhua0707/p/9452471.html)

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": {
          "version": 3,
          "proposals": true
        }
      }
    ]
  ]
}
```

> presets：是一组Plugins的集合，告诉babel要转换的源码使用了哪些新的语法特性，这样可以省略写多个 plugins

> @babel/preset-env 配置：
>
> - modules：将 ES6+ 模块语法转换为另一种类型，默认 auto，为了防止babel 将任何模块类型都转译成CommonJS类型，导致 tree-shaking 失效问题这里关掉

> @babel/plugin-transform-runtime 配置：
>
> - corejs：依赖包 `runtime-corejs` 的相关信息，这里使用的是 `runtime-corejs3` 所以版本信息 version 填3，proposals 默认 false，3版本可以选择开启，开启后代理不会污染全局变量

给 webpack 配上对 js 文件应用（为了之后兼容ts和tsx这里一并配了）

```js
// scripts/config/webpack.common.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      // other...
    ]
  },
  ...
}
```

> cacheDirectory：babel-loader 在执行的时候，可能会产生一些运行期间重复的公共文件，造成代码体积大冗余，同时也会减慢编译效率，所以开启该配置将这些公共文件缓存起来，下次编译就会加快很多
>
> exclude：第三方包不需要进行转译，排除后可加快打包速度

-----

#### 支持React

下载所需第三方包：

> `react`：react核心依赖
>
> `react-dom`：负责处理web端的dom的渲染
>
> `@types/react` ：react 类型声明文件，用于 tsx
>
> `@types/react-dom`：react-dom 类型声明文件，用于 tsx
>
> `@babel/preset-react` ：用于让 babel 可以转译 jsx 语法

```
yarn add react@17.0.2
yarn add react-dom@17.0.2
yarn add @types/react@17.0.3
yarn add @types/react-dom@17.0.3
yarn add @babel/preset-react@7.13.13
```

跟 babel 相关的配置需要在 `.babelrc` 中配置

```json
// .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ],
    "@babel/preset-react"
  ],
  ...
}
```

> 注意 presets 的处理顺序是数组由末到前，因此需要把 `@babel/preset-react` 配在 `@babel/preset-env` 后面，表示先将 jsx 处理成 ES6+js ，然后再将 ES6+js 处理成目标浏览器能识别的 js 代码块的意思

------

#### 支持Typescript

下载所需第三方包

> `typescript`：支持 ts
>
> `@babel/preset-typescript`：处理ts文件，原理是去掉ts的类型声明，然后再用其他 babel 插件进行编译

```
yarn add typescript@4.2.4
yarn add @babel/preset-typescript@7.13.0
```

同理修改 `.babelrc`

```json
// .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
}
```

需要使用 ts 时，需要在项目的根目录下配置 `tsconfig.json` ，因此新建该文件并配置（也可以通过 `npx tsc --init` 生成）

```json
{
  "compilerOptions": {
    // 基本配置
    "target": "ES5",                          // 编译成哪个版本的 es
    "module": "ESNext",                       // 指定生成哪个模块系统代码
    "lib": ["dom", "dom.iterable", "esnext"], // 编译过程中需要引入的库文件的列表
    "allowJs": true,                          // 允许编译 js 文件
    "jsx": "react",                           // 在 .tsx 文件里支持 JSX
    "isolatedModules": true,				  // 提供额外的一些语法检查，如文件没有模块导出会报错
    "strict": true,                           // 启用所有严格类型检查选项

    // 模块解析选项
    "moduleResolution": "node",               // 指定模块解析策略
    "esModuleInterop": true,                  // 支持 CommonJS 和 ES 模块之间的互操作性
    "resolveJsonModule": true,                // 支持导入 json 模块
    "baseUrl": "./",                          // 根路径
    "paths": {								  // 路径映射，与 baseUrl 关联
      "src/*": ["src/*"],
      "components/*": ["src/components/*"],
      "utils/*": ["src/utils/*"]
    },

    // 实验性选项
    "experimentalDecorators": true,           // 启用实验性的ES装饰器
    "emitDecoratorMetadata": true,            // 给源码里的装饰器声明加上设计类型元数据

    // 其他选项
    "forceConsistentCasingInFileNames": true, // 禁止对同一个文件的不一致的引用
    "skipLibCheck": true,                     // 忽略所有的声明文件（ *.d.ts）的类型检查
    "allowSyntheticDefaultImports": true,     // 允许从没有设置默认导出的模块中默认导入
    "noEmit": true							  // 只想使用tsc的类型检查作为函数时（当其他工具（例如Babel实际编译）时）使用它
  },
  "exclude": ["node_modules"]
}

```

> compilerOptions：配置编译选项[【compilerOptions配置字段信息】](https://www.tslang.cn/docs/handbook/compiler-options.html)
>
> - baseUrl 和 paths：用于快速定位某个文件，防止多层 `../../../...`，baseUrl 设为 `./` 代表项目根路径，path 相当于 `baseUrl/path` 路径映射，如上面配的 `"components/*": ["src/components/*"]` 实际上就是相当于把 `/src/components` 这个路径映射为了 `Components`，于是 `import xxx from '/src/components/xxx'` 相当于 `import xxx from coponents/xxx`，这里目前只配了三个，之后如果有需要可以回来这里继续配置

baseUrl 和 paths 需要配合 webpack 的 `resolve.alias` 属性使用，且两者配置要统一，实际上只在 webpack 这里配就可以完成映射关系，但是在 `tsconfig.json` 也配上的话可以添加代码智能提示

```js
// scripts/config/webpack.common.js
module.exports = {
  // other...
  resolve: {
    alias: {
      'src': path.resolve(PROJECT_PATH, './src'),
      'components': path.resolve(PROJECT_PATH, './src/components'),
      'utils': path.resolve(PROJECT_PATH, './src/utils'),
    }
  },
}
```

> resolve：配置webpack如何寻找模块对应的文件 [【resolve配置字段信息】](https://segmentfault.com/a/1190000013176083?utm_source=tag-newest)
>
> - alias：配置项通过别名来把原来导入路径映射成一个新的导入路径

可以分别创建上述路径的文件夹尝试效果

由于使用了 ts，在导入文件的时候可能会出现类型错误，如 css module 的 `import style from './index.scss'` 报错 `找不到模块“./index.scss”或其相应的类型声明`，因此需要手动编写声明类型文件，在 `src` 目录下新建 `typings` 目录并新建 `file.d.ts` 文件

```ts
// src/typings/file.d.ts
declare module "*.css" {
  const style: any;
  export default style
}

declare module "*.scss" {
  const style: any;
  export default style
}

declare module "*.less" {
  const style: any;
  export default style
}
```

----

#### 优化

##### 省略文件后缀名

webpack 可以省略后缀名查找并处理文件

```js
import App from './app.tsx'		// 处理前
import App from './app'			// 处理后
```

需要在 webpack 的 `resolve.extensions` 中进行配置

```js
// scripts/config/webpack.common.js
module.exports = {
  // other...
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
}
```

> extensions：在导入语句没带文件后缀时，webpack会自动带上后缀去尝试访问文件是否存在，extensions用于配置在尝试过程中用到的后缀列表，webpack 会按照定义的后缀名的顺序依次处理文件，在配置时尽量把最常用到的后缀放到最前面，可以缩短查找时间

##### js压缩

> `terser-webpack-plugin`：用去去除生产环境的无用js代码，webpack5 之后自带，不需要另行安装，直接引入使用即可

```js
// scripts/config/webpack.prod.js
const TerserPlugin = require("terser-webpack-plugin")

module.exports = merge(common, {
  optimization: {
    minimize: true,
    minimizer:[
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: { pure_funcs: ['console.log'] },
        }
      }),
    ]
  }
})
```

> extractComments：设为 false 表示去除所有注释，除了有特殊标志的注释如 `@preserve` 标记
>
> pure_funcs：去除函数，如上述配置的意思是将所有 `console.log` 函数去除

##### 打包类型检查

目前 webpack 打包时不会有类型检查信息（为了编译速度，babel 编译 ts 时直接将类型去除，并不会对 ts 的类型做检查），即使类型不正确终端也会显示打包成功，有误导性，为此添加上打包类型检查，下载第三方包：

> `fork-ts-checker-webpack-plugin`：ts 类型检查，让终端可以显示类型错误

```
yarn add fork-ts-checker-webpack-plugin@6.2.5
```

```js
// scripts/config/webpack.common.js
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
module.exports = {
  // ...other
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(PROJECT_PATH, './tsconfig.json'),
      },
    }),
  ],
}
```

**阶段测试**

注意此时用 tsx，因此需要回到 webpack 把入口文件从 js 格式改成 tsx 格式

```tsx
// src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

if (module && module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
)
```

```tsx
// src/app.tsx
import React from 'react'
import style from './app.scss'
import Test from 'components/Test'

const App:React.FC<any> = () => {
  return (
    <div className={style.app}>
      <Test name='jack' age={24}/>
    </div>
  )
}

export default App
```

```scss
// src/app.scss
.app {
  background-color: rgba(66, 91, 235, 0.87);
  display: flex;
}
```

```tsx
// src/components/Test/tsx
import React from 'react'

interface ITestProps {
  name: string
  age: number

}

const Test: React.FC<ITestProps> = ({name, age}) => (
  <div>I am{name}, {age}!!!</div>
)

export default Test
```

检查点：

- ES6+ 语法是否可用
- react语法是否可用
- ts 相关功能是否正常

-----

### 配置资源

#### 支持文件格式

webpack5 已内置资源模块，因此无需再下载 `file-loader`、`url-loader` [【详细说明】](https://blog.csdn.net/qq_15601471/article/details/115083790)

```js
// scripts/config/webpack.common.js
module.exports = {
  module: {
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2?)$/,
        type: 'asset/resource',
      },
    ]
  }
}
```

> type：资源模块类型
>
> - `asset/resource：将资源分割为单独的文件，并导出url，就是之前的 file-loader的功能
> - asset/inline：将资源导出为dataURL（url(data:)）的形式，之前的 url-loader的功能
> - asset/source：将资源导出为源码（source code）. 之前的 raw-loader 功能
> - asset：自动选择导出为单独文件或者 dataURL形式（默认为8KB）. 之前有url-loader设置asset size limit 限制实现
>
> dataUrlCondition：指定资源大小（单位字节）

为了规定打包目录，需要配置一下生产环境的打包出口

```js
// scripts/config/webpack.prod.js
module.exports = merge(common, {
  output: {
    // ...other
    assetModuleFilename: 'images/[name].[contenthash:8].[ext]',
  },
})
```

因为使用的是 ts，导入上述文件后缀名会产生不存在的错误，因此继续添加声明文件

```ts
// src/typings/file.d.ts
declare module '*.svg' {
  const path: string
  export default path
}

declare module '*.bmp' {
  const path: string
  export default path
}

declare module '*.gif' {
  const path: string
  export default path
}

declare module '*.jpg' {
  const path: string
  export default path
}

declare module '*.jpeg' {
  const path: string
  export default path
}

declare module '*.png' {
  const path: string
  export default path
}
```

----

#### 处理静态资源

为了将非导入形式在js文件中使用的资源也放到打包目录（如public下的静态资源），需要下载第三方包

> `copy-webpack-plugin`：处理不需要动态导入的静态资源文件，将其复制进打包目录

```
yarn add copy-webpack-plugin@8.1.1
```

```js
// scripts/config/webpack.common.js
module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: 'public', 
          from: '*',
          to: path.resolve(PROJECT_PATH, './dist/public'), 
          toType: 'dir',
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/index.html'],		// **表示任意目录下
          },
        },
      ],
    })
  ]
}
```

> content：解释 fron 路径，具体作用未知
>
> from：定义要拷贝的源文件
>
> to：定义粘贴的指定路径
>
> toType：确定粘贴路径的类型，dir表示路径为一个文件夹
>
> globOptions：允许使用全局匹配



-----

### Webpack优化

#### 清除打包数据

防止多次 build 导致文件积累

下载第三方包：

> `clean-webpack-plugin`：清除上一次打包的 dist 目录内容，防止文件残留

```
yarn add clean-webpack-plugin@4.0.0-alpha.0
```

```js
// scripts/config/webpack.common.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  ...
  plugins: [
    ...
    new CleanWebpackPlugin(),
  ],
}
```

#### 缓存机制

大大增快二次编译速度，webpack5 已内置该功能[【cache机制及配置参考】](https://blog.csdn.net/Qianliwind/article/details/109390355)

```js
// scripts/config/webpack.common.js
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
}
```

> cache.type：缓存类型，值为 `memory` 或 `filesystem`，分别代表基于内存的临时缓存，以及基于文件系统的持久化缓存
>
> cache.buildDependencies：全局缓存失效的一种机制，配置 `{config: [__filename]}`，表示当配置文件内容或配置文件依赖的模块文件发生变化时，当前的构建缓存即失效`

```
当模块代码没有发生变化，但是构建处理过程本身发生变化时（例如升级了 Webpack 版本、修改了配置文件、改变了环境变量等），也可能对构建后的产物代码产生影响。因此在这种情况下不能复用之前缓存的数据，而需要让全局缓存失效，重新构建并生成新的缓存
```

#### 代码分割

当使用懒加载写法时，webpack自动会对代码进行分割成不同的chunk

好处：

- 若通过懒加载引入的组件，若该组件代码不变，打出的包名也不会变，部署到生产环境后，因为浏览器缓存原因，用户不需要再次下载该文件，缩短了网页交互时间
- 防止把所有组件打进一个包，降低了页面首屏时间

```js
// 懒加载写法
import("./xxx").then(module => {
  console.log(module.foo())
})

// 在react中比较常见的是React.lazy
const MyComponent = React.lazy(() => import('Components/MyComponent'))
```

webpack默认开启代码分割，不过要想将第三方依赖也打包独立 chunk，需要在 webpack 额外进行配置

```js
// scripts/config/webpack.dev.js
module.exports = merge(common, {
  optimization: {
    minimize: false,
    minimizer: [],
    splitChunks: {
      chunks: 'all',
      minSize: 0,
    },
  },
})
```

```js
// scripts/config/webpack.prod.js
module.exports = merge(common, {
  optimization: {
	// ...other
    splitChunks: {
      chunks: 'all',
      minSize: 0,
    },
  }
})
```

> splitChunks：代码分割相关配置
>
> splitChunks.chunks：选择哪些内容进行优化，如果为 all 时表示即使同步和异步的代码也可以共享thunk
>
> minSize：生成chunk的最小大小（以字节为单位）



-----

### 问题与方案

**版本问题**

一：报错信息`Cannot find module 'webpack/bin/config-yargs`

问题：`webpack-cli`  和 `webpack-dev-server` 会有版本兼容问题导致打包报错

解决：统一版本，如本项目中统一使用 `3.x` 版本

-----

