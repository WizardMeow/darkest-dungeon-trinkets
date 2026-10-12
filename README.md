# 地牢档案 · 饰品

基于 Rsbuild 2、React 和 Papa Parse 的本地饰品目录。

```powershell
cd darkest-dungeon-trinkets
npm install
npm run dev
```

本机也可直接运行 `start.ps1`。默认地址为 `http://127.0.0.1:3000/`，端口被占用时以终端输出为准。

`npm run build` 生成 `dist/`；`npm run preview` 预览构建结果。

## 数据

- `public/data/饰品评级.csv`：单品及套装评级，网站直接读取此 CSV。
- `public/data/逐图索引.csv`：全部关键帧的逐图索引。
- `public/data/游戏饰品表.csv`：用于核对的原版和 DLC 饰品定义。
- `public/data/逐行原文.csv`：未经文本改写的 OCR 原文。
- `public/frames/`：对应截图；`public/icons/`：本机游戏饰品图标。

评级来源为清丽静《地牢大学习》23～30 期，属于作者观点。游戏属性来自本机安装定义，不含创意工坊模组。套装组合单独评级；低置信度文本与修正名称保留复核标记。

- 平台：[Bilibili](https://www.bilibili.com/)
- UP 主：[清丽静](https://space.bilibili.com/1412307924)
- 原合集：[暗黑地牢大学习](https://space.bilibili.com/1412307924/lists/6744111?type=season)
- 每条评级均保留对应视频链接及时间点，CSV 中也包含平台与 UP 主信息。

GitHub Pages 发布时采用构建结果的 `gh-pages` 分支。静态资源使用相对路径，支持仓库子路径。公开 CSV 去除本机路径，仅保留图片引用和游戏定义相对来源。

更新 public/data/ 中的 CSV 后刷新页面；发布时运行 npm run build，并将 dist/ 发布到 gh-pages 分支。

