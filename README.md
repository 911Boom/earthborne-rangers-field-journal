# Field Journal · Earthborne Rangers

一个非官方的本地交互记录工具，把 Earthborne Rangers 的**角色卡**、**战役记录表**、**成就徽章**和**官方原声试听**做成了可以直接点击、输入的网页。

**在线版本：<https://911boom.github.io/earthborne-rangers-field-journal/>**

无需安装、无需构建。除原声试听外，其余内容可离线使用；进度自动保存在浏览器本地。

---

## 快速开始

直接双击 `index.html` 即可，或双击 `open-journal.cmd`。

推荐使用最新版 Chrome / Edge。若你的浏览器在 `file://` 下限制本地存储，可以在本目录运行一个本地服务器：

```bash
python -m http.server 8765
```

然后打开 <http://127.0.0.1:8765/>。

> 直接用 `file://` 打开和通过本地服务器打开，属于两个不同的浏览器存储来源。请固定使用同一种方式，或在不同方式之间用「导出 / 导入备份」迁移进度。

---

## 功能

### 角色档案 / Character

- **游侠姓名、性格、定位、背景、专长、业余爱好**：横线处直接输入。
- **AWA / FIT / FOC / SPI 四项属性**：点击菱形在 1–3 之间循环；Shift + 点击或右键递减；也支持方向键。四项总和会与标准值 8 对照提示。
- **背景牌组与专长牌组**：各 5 张卡牌名称。
- **当前牌库**：30 个卡位，按 Enter 跳到下一行。
- **交易**：7 组「给出 / 换得」记录。

### 战役日志 / Campaign

- 可在 **Lure of the Valley（核心游戏）** 与 **Legacy of the Ancestors（扩展）** 之间切换，两套进度独立保存。
- **30 天日程**：点击日期圆圈标记完成，下一次未完成日会高亮；顶部按钮可快速标记下一日。
- 按官方记录表显示每天推荐的 **Valley 天气**；Legacy 还显示下排灰字的 **Arcology 推荐天气**。
- **任务**：填写任务开始天数、任务名称，点击三枚菱形记录进度，点击对勾标记完成。
  - 核心游戏：33 个任务位。
  - Legacy：30 个主任务位 + 10 个追加任务位。
- **游侠小队、当前位置、路径地形**：横线输入。
- **奖励 / 重要事件**：带横线的多栏笔记区，可自由换行输入。

### 成就徽章 / Achievements

- 收录官方页面上的 **16 个成就**及对应徽章图。
- 点击卡片切换达成状态：未达成时显示为灰色，达成后恢复彩色并出现对勾。
- 支持「全部 / 已达成 / 未达成」筛选，并显示完成进度环。

### 原声音乐 / Soundtrack

- 收录 Apple Music 上 **Earthborne Rangers (Official Soundtrack Preview) - EP** 的 4 首官方曲目。
- 内置播放器支持播放 / 暂停、上一首 / 下一首、拖动进度和自动续播，播放的是 **官方 30 秒试听片段**。
- 提供完整 34 首原声的 **Bandcamp** 入口，以及 Apple Music、官方播客等链接。
- 试听音频由 Apple Music 提供，需要联网；本页不下载或存储音频文件。完整专辑为付费内容。

---

## 文件结构

```text
index.html              页面结构
styles.css              全部样式（含响应式与打印样式）
app.js                  交互、状态、保存、成就与原声数据
assets/badges/          16 张官方成就徽章图
assets/soundtrack/      官方原声专辑封面
assets/fonts/           Fraunces / Karla 字体及 OFL 许可证
assets/topo.svg         背景等高线装饰
assets/favicon.svg      站点图标
open-journal.cmd        双击打开网页
```

---

## 说明

- 这是一个**非官方玩家工具**，与 Earthborne Games 无关联。
- Earthborne Rangers 相关名称、规则文本、原声音乐及成就徽章图 © Earthborne Games / Tom Figgins。官方资源：
  - <https://earthbornegames.com/resources/game-achievements/>
  - <https://earthbornegames.com/earthborne-rangers-downloads/>
  - [完整原声 · Bandcamp](https://earthbornegames.bandcamp.com/album/earthborne-rangers-original-soundtrack)
  - [官方试听 EP · Apple Music](https://music.apple.com/us/album/earthborne-rangers-official-soundtrack-preview-ep/1802670455)
- 角色卡基于 *Lure of the Valley* 版本的角色记录表；两套战役共用同一份角色档案。
- 成就描述中的中文为方便阅读的意译，实际规则以英文原文为准。
- 字体 **Fraunces** 与 **Karla** 以 SIL Open Font License 1.1 授权，许可证见 `assets/fonts/`。
- 官方参考 PDF 仅保存在本地参考目录，不随仓库分发。
- 所有进度只存在本机浏览器中，不会上传到任何服务器；原声试听直接从 Apple Music 的官方预览地址加载。
