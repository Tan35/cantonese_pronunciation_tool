# 粤语拼音标注工具 - 项目交付文档

## 项目概述

基于 ToJyutping 库开发的高级简约性冷淡风粤语拼音自动标注工具，支持字、词、句子的粤语拼音转换，提供多种输出格式。

## 部署信息

**线上访问地址：** https://j6h5i7c01qgz.manus.space

## 功能特性

### 核心功能
- ✅ 支持字、词、句子输入
- ✅ 实时转换显示
- ✅ 多种输出格式
- ✅ 候选读音显示
- ✅ 一键复制结果
- ✅ 示例文本快速体验

### 输出格式
1. **粤拼标注** - 你(nei5)好(hou2)
2. **纯拼音** - nei5 hou2
3. **IPA标注** - 你[nei̯˩˧]好[hou̯˧˥]
4. **候选读音** - 显示多音字的所有可能读音

### 设计特色
- 🎨 高级简约性冷淡风设计
- 📱 响应式布局，支持桌面和移动设备
- ✨ 流畅的动画效果和微交互
- 🎯 直观的用户界面
- 🚀 快速响应的实时转换

## 技术架构

### 后端技术栈
- **框架：** Flask
- **核心库：** ToJyutping 3.2.0
- **跨域支持：** Flask-CORS
- **部署：** Manus 云平台

### 前端技术栈
- **框架：** React 18
- **构建工具：** Vite
- **样式：** Tailwind CSS
- **UI组件：** shadcn/ui
- **动画：** Framer Motion
- **图标：** Lucide React

### API接口

#### 1. 转换接口
```
POST /api/pronunciation/convert
Content-Type: application/json

{
  "text": "你好",
  "format": "jyutping"
}
```

#### 2. 格式列表
```
GET /api/pronunciation/formats
```

#### 3. 示例文本
```
GET /api/pronunciation/examples
```

#### 4. 健康检查
```
GET /api/pronunciation/health
```

## 项目结构

```
cantonese_pronunciation_tool/
├── backend/                 # Flask后端应用
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── static/         # 前端构建文件
│   │   └── main.py         # 应用入口
│   ├── venv/               # Python虚拟环境
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # UI组件
│   │   └── App.jsx         # 主应用组件
│   ├── dist/               # 构建输出
│   └── package.json        # Node.js依赖
└── design_references/      # 设计参考图片
```

## 使用说明

### 基本使用
1. 访问 https://j6h5i7c01qgz.manus.space
2. 在输入框中输入中文文本
3. 选择所需的输出格式
4. 查看实时转换结果
5. 点击复制按钮复制结果

### 示例体验
- 点击页面下方的示例文本可快速体验
- 支持的示例包括：
  - 你好（简单问候）
  - 咁啱老世要求佢等陣要開會（日常对话）
  - 香港係一個國際金融中心（描述性句子）
  - 我鍾意食點心（表达喜好）
  - 今日天氣好好（天气描述）

## 技术特点

### ToJyutping 库优势
- 准确率达 99%
- 支持多音字候选
- 提供 IPA 国际音标
- 按概率排序读音

### 性能优化
- 实时转换（500ms 防抖）
- 响应式设计
- 优化的构建输出
- CDN 加速部署

## 维护说明

### 本地开发
```bash
# 后端开发
cd backend
source venv/bin/activate
python src/main.py

# 前端开发
cd frontend
pnpm run dev
```

### 部署更新
```bash
# 构建前端
cd frontend
pnpm run build

# 复制到后端
cp -r dist/* ../backend/src/static/

# 重新部署
# 使用 Manus 平台重新部署后端
```

## 项目亮点

1. **设计美学** - 采用性冷淡风设计，简约而不简单
2. **用户体验** - 实时转换，无需点击按钮
3. **功能完整** - 支持多种输出格式和候选读音
4. **技术先进** - 使用现代前后端分离架构
5. **部署便捷** - 一键部署到云平台

## 联系信息

如有任何问题或需要技术支持，请联系开发团队。

---

**开发完成时间：** 2025年7月12日  
**版本：** v1.0.0  
**状态：** 已部署上线

