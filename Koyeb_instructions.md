
# 粤语拼音标注工具：Koyeb部署指南

## 1. Koyeb部署概述

Koyeb是一个无服务器平台，旨在简化应用程序的部署和扩展。它支持多种编程语言和框架，包括Python Flask后端和React前端。与Vercel将Python后端作为Serverless Functions处理不同，Koyeb可以更直接地将Flask应用部署为常驻的Web服务，这对于某些需要更传统服务器行为的应用可能更为方便。同时，Koyeb也支持将前端静态文件部署为独立的静态站点服务，并且对Monorepo（单体仓库）有良好的支持，这意味着前端和后端代码可以存在于同一个Git仓库的不同子目录中。

### 1.1 Koyeb部署原理

在Koyeb上部署本项目，通常会创建两个独立的服务：

*   **后端服务 (Python Flask):** Koyeb会检测你的Python Flask项目，并使用其内置的Buildpack（构建包）来构建和运行你的Flask应用。你可以选择使用Gunicorn等WSGI服务器来运行Flask应用，Koyeb会负责容器化、部署和管理。这个服务将提供你的API接口（例如 `/api/pronunciation/convert`）。
*   **前端服务 (React Static Site):** Koyeb可以将你的React应用构建后的静态文件部署为一个独立的静态站点服务。这些文件将通过Koyeb的全球边缘网络进行分发，提供快速的加载速度。

这种双服务部署模式允许前端和后端独立扩展和管理，同时利用Koyeb的无服务器特性，实现自动扩缩容和高可用性。

## 2. 项目结构调整

本项目目前的结构已经非常适合Koyeb的Monorepo部署：

```
cantonese_pronunciation_tool/
├── backend/               # Flask后端项目
│   ├── src/               # Flask应用源代码
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── pronunciation.py
│   │   │   └── user.py
│   │   └── static/        # 前端构建后的静态文件将放置在此处 (可选，如果前端独立部署则不需要)
│   ├── venv/              # Python虚拟环境
│   ├── requirements.txt   # Python依赖
│   └── Procfile           # Koyeb用于启动应用的命令 (新增)
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

**关键的调整在于：**

1.  **`Procfile` 文件 (后端):** 在 `cantonese_pronunciation_tool/backend/` 目录下创建一个 `Procfile` 文件，用于告诉Koyeb如何启动你的Flask应用。这是Koyeb（以及Heroku等平台）识别应用启动命令的标准方式。
2.  **前端构建产物:** 对于Koyeb，你可以选择将前端构建产物复制到后端 `static` 目录，然后由后端服务提供；或者更推荐的方式是，将前端构建产物独立部署为一个静态站点服务。后者更符合前后端分离的原则，也更利于前端的CDN加速。

## 3. 部署前的准备工作

在将项目推送到Git仓库并部署到Koyeb之前，请确保完成以下准备工作：

### 3.1 确保前端已构建

在你的本地项目根目录 (`cantonese_pronunciation_tool/`) 执行以下命令：

```bash
# 进入前端目录并安装依赖 (如果尚未安装)
cd frontend
pnpm install # 或者 npm install / yarn install

# 构建前端项目
pnpm run build # 或者 npm run build / yarn build
```

这将生成 `frontend/dist` 目录，其中包含了你的前端静态文件。Koyeb在部署前端服务时会使用这个目录。

### 3.2 创建 `Procfile` 文件 (后端)

在 `cantonese_pronunciation_tool/backend/` 目录下创建 `Procfile` 文件，并添加以下内容：

```
web: gunicorn --bind 0.0.0.0:$PORT main:app
```

**`Procfile` 配置解释：**

*   `web:`：指定这是一个Web服务。Koyeb会寻找这个前缀来启动你的Web应用。
*   `gunicorn --bind 0.0.0.0:$PORT main:app`：这是启动Flask应用的标准Gunicorn命令。
    *   `gunicorn`: 一个Python WSGI HTTP服务器，用于生产环境运行Flask应用。
    *   `--bind 0.0.0.0:$PORT`: 告诉Gunicorn监听所有网络接口上的 `$PORT` 环境变量指定的端口。Koyeb会自动设置这个环境变量。
    *   `main:app`: 指向你的Flask应用实例。这里假设你的Flask应用实例在 `backend/src/main.py` 文件中被命名为 `app`。

**注意：** 你需要确保 `gunicorn` 已经包含在你的 `backend/requirements.txt` 文件中。如果不在，请手动添加 `gunicorn` 到 `requirements.txt`。

### 3.3 准备 `requirements.txt` 文件 (后端)

确保你的Flask后端项目 (`backend/`) 目录下有一个 `requirements.txt` 文件，其中列出了所有Python依赖，包括 `Flask`、`ToJyutping`、`flask-cors` 和 `gunicorn`。Koyeb在构建Python应用时会根据这个文件安装依赖。

```bash
# 在 backend 目录下执行
pip freeze > requirements.txt
```

### 3.4 Git 仓库准备

将你的整个 `cantonese_pronunciation_tool` 项目（包括 `backend` 和 `frontend` 目录以及 `Procfile` 文件）推送到一个Git仓库（如GitHub、GitLab或Bitbucket）。

## 4. Koyeb 部署流程

Koyeb的部署流程通常通过其控制面板进行。你需要创建两个独立的服务：一个用于后端，一个用于前端。

### 4.1 部署后端服务 (Python Flask API)

1.  **登录 Koyeb:** 访问 [app.koyeb.com](https://app.koyeb.com/) 并使用你的Git提供商账号登录。
2.  **创建新应用:** 在Koyeb控制面板中，点击“Create App”。
3.  **选择部署方式:** 选择“Deploy from Git”。
4.  **连接 Git 仓库:** 选择你刚刚推送的Git仓库。
5.  **配置服务:**
    *   **Service Name:** 为你的后端服务命名，例如 `cantonese-pronunciation-api`。
    *   **Branch:** 选择你要部署的分支（通常是 `main` 或 `master`）。
    *   **Builder:** 选择 `Python`。
    *   **Build Command:** Koyeb通常会自动检测，但如果需要，可以指定 `pip install -r requirements.txt`。
    *   **Run Command:** Koyeb会自动检测 `Procfile` 中的 `web` 命令，即 `gunicorn --bind 0.0.0.0:$PORT main:app`。
    *   **Root Directory:** **非常重要！** 设置为 `backend`，告诉Koyeb你的Python项目在仓库的哪个子目录下。
    *   **Exposed Ports:** 确保端口设置为 `5001` (如果你的Flask应用监听的是这个端口) 或者 `8000` (Gunicorn默认端口)。Koyeb会自动将 `$PORT` 环境变量映射到这个端口。
    *   **Health Checks:** 可以配置健康检查，确保服务正常运行。
    *   **Environment Variables:** 如果你的Flask应用需要任何环境变量，可以在这里添加。
6.  **部署:** 点击“Deploy”按钮。Koyeb会开始构建和部署你的后端服务。部署成功后，你会得到一个后端服务的URL。

### 4.2 部署前端服务 (React Static Site)

1.  **在同一个应用下创建新服务:** 在Koyeb控制面板中，找到你刚刚创建的应用（例如 `cantonese-pronunciation-tool`），然后点击“Add Service”。
2.  **选择部署方式:** 选择“Deploy from Git”。
3.  **连接 Git 仓库:** 再次选择同一个Git仓库。
4.  **配置服务:**
    *   **Service Name:** 为你的前端服务命名，例如 `cantonese-pronunciation-frontend`。
    *   **Branch:** 选择你要部署的分支。
    *   **Builder:** 选择 `Static Site`。
    *   **Build Command:** 输入 `pnpm install && pnpm run build` (如果你使用pnpm)。如果使用npm或yarn，则相应修改为 `npm install && npm run build` 或 `yarn install && yarn build`。
    *   **Output Directory:** **非常重要！** 设置为 `frontend/dist`，告诉Koyeb你的静态文件在哪里。
    *   **Root Directory:** **非常重要！** 设置为 `frontend`，告诉Koyeb你的前端项目在仓库的哪个子目录下。
    *   **Environment Variables:** 如果前端需要任何环境变量（例如后端API的URL），可以在这里添加。例如，你可以添加一个 `VITE_API_BASE_URL` 环境变量，其值设置为你后端服务的URL。
5.  **部署:** 点击“Deploy”按钮。Koyeb会开始构建和部署你的前端服务。部署成功后，你会得到一个前端服务的URL。

## 5. 前后端通信配置

由于前端和后端是两个独立的服务，它们将拥有不同的URL。前端需要知道如何访问后端API。你可以通过以下方式配置：

1.  **环境变量:** 在Koyeb前端服务的环境变量中，添加一个变量，例如 `VITE_API_BASE_URL`，并将其值设置为你的后端服务的URL（例如 `https://your-backend-service.koyeb.app`）。
2.  **前端代码修改:** 在前端代码中，使用这个环境变量来构建API请求的URL。例如，在 `App.jsx` 中，你可以这样获取环境变量：

    ```javascript
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                         (window.location.protocol + '//' + window.location.host);
    // 然后在API请求中使用：
    // fetch(`${API_BASE_URL}/api/pronunciation/convert`, ...)
    ```

    **注意：** `import.meta.env.VITE_API_BASE_URL` 是Vite获取环境变量的方式。在生产构建时，Vite会将这些环境变量替换为实际的值。

3.  **CORS:** 确保你的Flask后端（`flask-cors`）配置允许来自前端域名的跨域请求。由于Koyeb的服务通常在同一个Koyeb应用下可以相互通信，并且Koyeb会自动处理一些内部路由，但为了外部访问和清晰起见，最好还是在Flask中明确配置CORS。

## 6. 部署后的验证与注意事项

### 6.1 验证功能

访问Koyeb提供的前端服务URL，验证以下功能是否正常：

*   **前端界面:** 检查页面是否正常加载，样式是否正确，黑暗模式切换是否有效。
*   **拼音转换:** 输入中文文本，测试粤语拼音转换功能是否正常。这会验证前端是否能正确调用后端API。
*   **复制提示:** 验证复制成功提示是否按预期显示。

### 6.2 注意事项

*   **服务间通信:** 在Koyeb内部，服务可以通过内部网络名称相互通信，例如，前端服务可以通过 `http://cantonese-pronunciation-api.your-app-name.koyeb` 访问后端服务。这在某些情况下可以避免公共URL的延迟。
*   **日志查看:** Koyeb提供了详细的构建和运行时日志，如果部署失败或应用出现问题，可以查看日志进行诊断。
*   **自定义域名:** 部署成功后，你可以在Koyeb控制面板中为你的应用配置自定义域名。
*   **持续集成/持续部署 (CI/CD):** Koyeb与Git仓库集成，每次你向指定分支推送新的代码，Koyeb都会自动触发新的构建和部署。

通过遵循本指南，你应该能够成功地将你的粤语拼音标注工具部署到Koyeb，并利用其强大的功能为用户提供稳定、高效的服务。Koyeb对于前后端分离的Python+React项目是一个非常友好的选择。

