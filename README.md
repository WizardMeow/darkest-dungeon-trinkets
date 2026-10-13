# 地牢档案 · 饰品与怪癖

基于 Rsbuild 2、React 和 Papa Parse 的本地饰品目录。

- 网站：https://wizardmeow.github.io/darkest-dungeon-trinkets/
- GitHub 仓库：https://github.com/WizardMeow/darkest-dungeon-trinkets

```powershell
cd web
npm install
npm run dev
```

本机也可直接运行 `web/start.ps1`。默认地址为 `http://127.0.0.1:3000/`，端口被占用时以终端输出为准。

`npm run build` 生成 `dist/`；`npm run preview` 预览构建结果。

## 数据

- `public/data/饰品评级.csv`：单品及套装评级，网站直接读取此 CSV。
- `public/data/逐图索引.csv`：全部关键帧的逐图索引。
- `public/data/游戏饰品表.csv`：用于核对的原版和 DLC 饰品定义。
- `public/data/逐行原文.csv`：未经文本改写的 OCR 原文。
- `public/frames/`：对应截图；`public/icons/`：本机游戏饰品图标。

评级来源为清丽静《地牢大学习》23～30 期，属于作者观点。游戏属性来自本机安装定义，不含创意工坊模组。套装组合单独评级；低置信度文本与修正名称保留复核标记。

怪癖 tab 来源为第 21 期《怪癖评级》和第 22 期《英雄特质培养》，覆盖 18 位英雄的候选方案、特殊怪癖分配以及正负面 T0–T3 评级。正面 T0 表示优先培养，负面 T0 表示优先处理；同一怪癖的条件评级保留为独立记录。

- `public/data/怪癖评级.csv`：评级、条件、作者说明、游戏效果与来源。
- `public/data/英雄推荐怪癖.csv`：英雄、方案、方向、候选怪癖与来源。
- `public/data/怪癖逐图索引.csv`、`怪癖逐行原文.csv`：173 张截图的 OCR 依据。
- `public/data/quirks.json`：网站怪癖数据；`public/quirk-frames/`：来源截图。

候选池不等于全部锁定。按方案选择三个普通锁定正面怪癖；棱镜怪癖自带锁定。原图与时间链接可用于核对低分辨率 OCR 文本。

- 平台：[Bilibili](https://www.bilibili.com/)
- UP 主：[清丽静](https://space.bilibili.com/1412307924)
- 原合集：[暗黑地牢大学习](https://space.bilibili.com/1412307924/lists/6744111?type=season)
- 每条评级均保留对应视频链接及时间点，CSV 中也包含平台与 UP 主信息。

GitHub Pages 发布时采用构建结果的 `gh-pages` 分支。静态资源使用相对路径，支持仓库子路径。公开 CSV 去除本机路径，仅保留图片引用和游戏定义相对来源。

刷新数据前先生成工作区的 `work/rating_data.json`，然后从仓库根目录运行 `python -X utf8 tools/export_trinket_ratings.py`。修改 CSV 后刷新网页即可读取最新数据。
