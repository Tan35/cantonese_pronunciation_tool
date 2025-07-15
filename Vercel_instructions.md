# 粤语拼音标注工具：Vercel部署指南

## 1. Vercel部署概述

Vercel是一个为前端开发者量身定制的云平台，它以其“零配置部署”和对现代Web技术栈的强大支持而闻名。对于本项目这种React前端与Python Flask后端结合的应用，Vercel提供了一种优雅的解决方案：将React前端作为静态站点部署，而Python Flask后端则作为**Serverless Functions（无服务器函数）**运行。这意味着你无需管理服务器，Vercel会自动处理应用的构建、部署、扩缩容和全球分发。

### 1.1 Vercel部署原理

当你在Vercel上部署一个项目时，Vercel会根据你的项目结构和配置自动识别项目类型并进行相应的处理：

*   **前端 (React/Vite):** Vercel会检测到你的`frontend`目录是一个Vite/React项目，并使用其内置的构建系统将其编译成静态文件（HTML, CSS, JavaScript）。这些静态文件会被部署到Vercel的全球CDN（内容分发网络）上，确保用户从最近的边缘节点获取资源，从而实现极快的加载速度。
*   **后端 (Python Flask):** Vercel通过其**Python Runtime**支持Serverless Functions。这意味着你的Flask应用不会作为一个常驻进程运行，而是被Vercel打包成一个或多个函数。当HTTP请求到达时，Vercel会按需“唤醒”这些函数，执行请求处理逻辑，然后返回响应。处理完成后，函数实例可能会被“冻结”或销毁，以节省资源。这种模式非常适合API服务，因为它能够自动扩缩容，并且只在有请求时才产生计算费用。

为了让Vercel正确识别和部署前后端，我们需要进行一些项目结构上的调整和Vercel特定的配置。

## 2. 项目结构调整

为了在Vercel上顺利部署，你需要确保你的项目结构符合Vercel的约定。本项目目前的结构是：

```
cantonese_pronunciation_tool/
├── backend/               # Flask后端项目
│   ├── src/               # Flask应用源代码
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── pronunciation.py
│   │   │   └── user.py
│   │   └── static/        # 前端构建后的静态文件将放置在此处
│   ├── venv/              # Python虚拟环境
│   ├── requirements.txt   # Python依赖
│   └── vercel.json        # Vercel部署配置 (新增)
├── frontend/              # React前端项目
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── vite.config.js
│   └── dist/              # 前端构建输出目录
├── .gitignore
└── README.md
```

关键的调整在于：

1.  **前端构建产物位置:** 在本地开发时，前端构建产物通常在`frontend/dist`。在部署到Vercel时，我们需要将前端构建产物复制到Flask后端项目的`src/static`目录下。这样，Flask应用在作为Serverless Function运行时，可以同时提供静态文件服务。
2.  **`vercel.json` 文件:** 这是Vercel部署的核心配置文件，用于告诉Vercel如何构建和部署你的项目。你需要在`backend`目录下创建这个文件。

## 3. 部署前的准备工作

在将项目推送到Git仓库并部署到Vercel之前，请确保完成以下准备工作：

### 3.1 确保前端已构建并复制到后端静态目录

在你的本地项目根目录 (`cantonese_pronunciation_tool/`) 执行以下命令：

```bash
# 进入前端目录并安装依赖 (如果尚未安装)
cd frontend
pnpm install # 或者 npm install / yarn install

# 构建前端项目
pnpm run build # 或者 npm run build / yarn build

# 返回项目根目录
cd ..

# 清空后端静态目录并复制前端构建产物
rm -rf backend/src/static/*
cp -r frontend/dist/* backend/src/static/
```

这一步是确保Flask后端能够直接提供前端的静态文件。每次前端代码有更新时，都需要重复这一步。

### 3.2 创建 `vercel.json` 配置文件

在 `cantonese_pronunciation_tool/backend/` 目录下创建 `vercel.json` 文件，并添加以下内容：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.py",
      "use": "@vercel/python",
      "config": { "maxLambdaSize": "15mb", "runtime": "python3.9" }
    },
    {
      "src": "src/static/**",
      "use": "@vercel/static-build",
      "config": { "distDir": "src/static" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "src/static/$1"
    }
  ]
}
```

**`vercel.json` 配置解释：**

*   `version`: 指定Vercel配置文件的版本，通常为`2`。
*   `builds`: 定义了Vercel如何构建你的项目。它是一个数组，每个元素定义一个构建步骤。
    *   第一个构建步骤：
        *   `src: 


src/main.py`：指定了作为Serverless Function的入口文件，即你的Flask应用主文件。
        *   `use: @vercel/python`：告诉Vercel使用Python Runtime来构建和运行这个文件。
        *   `config: { "maxLambdaSize": "15mb", "runtime": "python3.9" }`：配置Serverless Function的参数。`maxLambdaSize`是函数包的最大大小，`runtime`指定了Python版本。建议使用`python3.9`或`python3.10`，因为它们通常更稳定且支持更广泛的库。请注意，`ToJyutping`库可能较大，如果超过15MB，可能需要调整此值或考虑其他优化方法。
    *   第二个构建步骤：
        *   `src: src/static/**`：匹配`src/static`目录下的所有文件，这些是你的前端静态资源。
        *   `use: @vercel/static-build`：告诉Vercel将这些文件作为静态资源进行处理。
        *   `config: { "distDir": "src/static" }`：指定静态资源的输出目录，即`src/static`。
*   `routes`: 定义了Vercel如何路由传入的请求。
    *   第一个路由规则：
        *   `src: /api/(.*)`：匹配所有以`/api/`开头的请求路径。这通常是你的后端API接口。
        *   `dest: src/main.py`：将这些请求路由到`src/main.py`这个Serverless Function进行处理。
    *   第二个路由规则：
        *   `src: /(.*)`：匹配所有其他请求路径（即非`/api/`开头的请求）。
        *   `dest: src/static/$1`：将这些请求路由到`src/static`目录下的相应静态文件。这确保了你的前端应用（例如`index.html`）能够被正确访问。

### 3.3 准备 `requirements.txt` 文件

确保你的Flask后端项目 (`backend/`) 目录下有一个 `requirements.txt` 文件，其中列出了所有Python依赖，包括 `Flask`、`ToJyutping` 和 `flask-cors` 等。Vercel在构建Python Serverless Function时会根据这个文件安装依赖。

```bash
# 在 backend 目录下执行
pip freeze > requirements.txt
```

### 3.4 Git 仓库准备

将你的整个 `cantonese_pronunciation_tool` 项目（包括 `backend` 和 `frontend` 目录以及 `vercel.json` 文件）推送到一个Git仓库（如GitHub、GitLab或Bitbucket）。确保 `vercel.json` 文件位于 `backend` 目录下，并且 `backend` 目录是你的Vercel项目的根目录。

## 4. Vercel 部署流程

完成上述准备工作后，你可以开始在Vercel上部署你的项目。

### 4.1 导入项目

1.  **登录 Vercel:** 访问 [vercel.com](https://vercel.com/) 并使用你的Git提供商（GitHub、GitLab或Bitbucket）账号登录。
2.  **创建新项目:** 在Vercel Dashboard中，点击“Add New...” -> “Project”。
3.  **导入 Git 仓库:** 选择你刚刚推送的Git仓库。Vercel会自动检测到仓库中的项目。

### 4.2 配置项目

在导入项目后，Vercel会进入项目配置阶段。你需要进行以下设置：

1.  **Root Directory (根目录):** 这是最关键的一步。你需要将项目的根目录设置为你的Flask后端所在的目录，即 `backend/`。在“Root Directory”选项中，点击“Edit”，然后输入 `backend`。
2.  **Build and Output Settings (构建和输出设置):** Vercel通常会自动检测到你的项目类型。由于你在 `backend/` 目录中放置了 `vercel.json`，Vercel会根据该文件进行构建。你无需手动修改构建命令或输出目录，除非有特殊需求。
3.  **Environment Variables (环境变量):** 如果你的Flask应用需要任何环境变量（例如数据库连接字符串、API密钥等），你可以在这里添加。本项目目前没有特殊环境变量需求。

### 4.3 部署

点击“Deploy”按钮。Vercel会开始构建和部署你的项目。这个过程可能需要几分钟，具体取决于你的项目大小和依赖数量。

*   **构建日志:** 你可以在Vercel Dashboard中实时查看构建日志，了解部署进度和可能遇到的问题。
*   **部署成功:** 部署成功后，Vercel会为你提供一个唯一的URL，你可以通过这个URL访问你的粤语拼音标注工具。

## 5. 部署后的验证与注意事项

### 5.1 验证功能

访问Vercel提供的部署URL，验证以下功能是否正常：

*   **前端界面:** 检查页面是否正常加载，样式是否正确，黑暗模式切换是否有效。
*   **拼音转换:** 输入中文文本，测试粤语拼音转换功能是否正常，包括各种格式的输出。
*   **复制提示:** 验证复制成功提示是否按预期显示。

### 5.2 注意事项

*   **冷启动 (Cold Start):** 由于后端是Serverless Functions，在一段时间没有请求后，第一次请求可能会有轻微的冷启动延迟。这是无服务器架构的常见特性。
*   **依赖大小:** 确保 `requirements.txt` 中列出的所有依赖及其传递依赖的总大小不超过Vercel Serverless Function的限制（默认为50MB，但`maxLambdaSize`配置为15MB）。如果超出，可能需要优化依赖或考虑使用Vercel的[Build Output API](https://vercel.com/docs/build-output-api/v3) 进行更精细的控制。
*   **日志查看:** 如果遇到问题，可以通过Vercel Dashboard查看Serverless Functions的运行时日志，帮助你诊断问题。
*   **自定义域名:** 部署成功后，你可以在Vercel Dashboard中为你的应用配置自定义域名。
*   **持续集成/持续部署 (CI/CD):** 一旦项目与Git仓库连接，每次你向主分支推送新的代码，Vercel都会自动触发新的部署，实现持续部署。

通过遵循本指南，你应该能够成功地将你的粤语拼音标注工具部署到Vercel，并利用其强大的功能为用户提供稳定、高效的服务。

