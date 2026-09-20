const TAROT_CARDS = [
  {
    "id": "major-00-fool",
    "name": "愚人",
    "en": "THE FOOL",
    "rank": "0",
    "kind": "begin",
    "keywords": "起点 · 好奇",
    "meaning": "你不必等到万事俱备才迈出第一步。新的尝试需要好奇心，也需要看清脚下的路。",
    "advice": "选一个风险可控的小尝试，先体验，再决定是否继续。"
  },
  {
    "id": "major-01-magician",
    "name": "魔术师",
    "en": "THE MAGICIAN",
    "rank": "I",
    "kind": "begin",
    "keywords": "主动 · 资源",
    "meaning": "你手中的经验、人脉与工具，可能已经足够支持一次行动。把分散的想法收拢，才能看见自己的力量。",
    "advice": "写下现有的三项资源，再确定今天能完成的一步。"
  },
  {
    "id": "major-02-high-priestess",
    "name": "女祭司",
    "en": "THE HIGH PRIESTESS",
    "rank": "II",
    "kind": "reflect",
    "keywords": "直觉 · 倾听",
    "meaning": "有些答案还没有浮到表面。先观察自己的感受，也给尚不清楚的信息一点时间。",
    "advice": "把事实与猜测分开记录，不急着替未知下结论。"
  },
  {
    "id": "major-03-empress",
    "name": "皇后",
    "en": "THE EMPRESS",
    "rank": "III",
    "kind": "connect",
    "keywords": "滋养 · 成长",
    "meaning": "照顾与创造需要适合生长的环境。温柔不是无限付出，也包括承认自己的需要。",
    "advice": "给一件重要的事留出稳定的时间和空间。"
  },
  {
    "id": "major-04-emperor",
    "name": "皇帝",
    "en": "THE EMPEROR",
    "rank": "IV",
    "kind": "steady",
    "keywords": "秩序 · 边界",
    "meaning": "清楚的规则能带来踏实感。可靠的安排比一时的强硬更能支持你，也要给变化留些余地。",
    "advice": "明确一条边界，并用平静、具体的话说明它。"
  },
  {
    "id": "major-05-hierophant",
    "name": "教皇",
    "en": "THE HIEROPHANT",
    "rank": "V",
    "kind": "steady",
    "keywords": "经验 · 学习",
    "meaning": "成熟的方法与可信的经验值得参考。你可以向人请教，同时保留自己的判断。",
    "advice": "找一位有相关经验的人，带着具体问题请教。"
  },
  {
    "id": "major-06-lovers",
    "name": "恋人",
    "en": "THE LOVERS",
    "rank": "VI",
    "kind": "connect",
    "keywords": "选择 · 一致",
    "meaning": "真正重要的是选择是否与你珍视的东西一致。关系中的靠近，也需要彼此清楚地表达意愿。",
    "advice": "写下你最看重的两项价值，检查当前选择是否相符。"
  },
  {
    "id": "major-07-chariot",
    "name": "战车",
    "en": "THE CHARIOT",
    "rank": "VII",
    "kind": "begin",
    "keywords": "方向 · 自律",
    "meaning": "多股力量可能同时拉扯你的注意力。先确定方向，再安排速度，比一味向前冲更有帮助。",
    "advice": "为一个目标设置清楚的下一步，同时保留调整空间。"
  },
  {
    "id": "major-08-strength",
    "name": "力量",
    "en": "STRENGTH",
    "rank": "VIII",
    "kind": "steady",
    "keywords": "耐心 · 温柔",
    "meaning": "稳定的力量不一定表现为强硬。接纳情绪、温和坚持，往往比压抑或对抗更持久。",
    "advice": "情绪上来时先缓一缓，再表达真正的需要。"
  },
  {
    "id": "major-09-hermit",
    "name": "隐者",
    "en": "THE HERMIT",
    "rank": "IX",
    "kind": "reflect",
    "keywords": "独处 · 理清",
    "meaning": "暂时远离喧闹，有助于分辨自己的声音。独处可以帮助整理思绪，但不必把自己与支持隔绝。",
    "advice": "留出一小段不受打扰的时间，写下最需要回答的问题。"
  },
  {
    "id": "major-10-wheel-of-fortune",
    "name": "命运之轮",
    "en": "WHEEL OF FORTUNE",
    "rank": "X",
    "kind": "adjust",
    "keywords": "变化 · 时机",
    "meaning": "环境会改变，有些部分并不由你控制。留意变化，调整自己的回应，比执着于固定剧本更实际。",
    "advice": "把事情分成可控与不可控两栏，只为前者安排动作。"
  },
  {
    "id": "major-11-justice",
    "name": "正义",
    "en": "JUSTICE",
    "rank": "XI",
    "kind": "reflect",
    "keywords": "事实 · 公平",
    "meaning": "这张牌邀请你看清事实、责任与后果。公平也包括让自己的需求与他人的边界同时被看见。",
    "advice": "重要约定写清楚，再核对一次细节。"
  },
  {
    "id": "major-12-hanged-man",
    "name": "倒吊人",
    "en": "THE HANGED MAN",
    "rank": "XII",
    "kind": "reflect",
    "keywords": "暂停 · 换位",
    "meaning": "停下来不必等于失败。换一个角度，可能让你看见一直被忽略的条件与代价。",
    "advice": "暂缓一个不紧急的决定，试着写出另一种解释。"
  },
  {
    "id": "major-13-death",
    "name": "死神",
    "en": "DEATH",
    "rank": "XIII",
    "kind": "release",
    "keywords": "结束 · 更新",
    "meaning": "这张牌以结束象征转变，并不预示现实中的死亡。旧习惯或旧安排的退场，可能为新的阶段腾出空间。",
    "advice": "选一件已经不适合的旧事，安排温和而明确的收尾。"
  },
  {
    "id": "major-14-temperance",
    "name": "节制",
    "en": "TEMPERANCE",
    "rank": "XIV",
    "kind": "steady",
    "keywords": "调和 · 节奏",
    "meaning": "不同需要不必靠极端取舍解决。找到能持续的节奏，比一次做到完美更重要。",
    "advice": "把一个过大的目标调小，设成可以持续的日常动作。"
  },
  {
    "id": "major-15-devil",
    "name": "恶魔",
    "en": "THE DEVIL",
    "rank": "XV",
    "kind": "adjust",
    "keywords": "依附 · 觉察",
    "meaning": "某种习惯、欲望或外界评价，可能正在占据过多空间。看见束缚，是找回选择余地的起点。",
    "advice": "辨认一个反复消耗你的模式，先减少一次自动反应。"
  },
  {
    "id": "major-16-tower",
    "name": "高塔",
    "en": "THE TOWER",
    "rank": "XVI",
    "kind": "adjust",
    "keywords": "松动 · 重建",
    "meaning": "当原有理解受到挑战，先照顾当下的稳定。这张牌象征重新审视基础，不是灾难预告。",
    "advice": "检查一个脆弱环节，准备可执行的替代方案。"
  },
  {
    "id": "major-17-star",
    "name": "星星",
    "en": "THE STAR",
    "rank": "XVII",
    "kind": "connect",
    "keywords": "希望 · 修复",
    "meaning": "经历消耗之后，你可以慢慢恢复信任与期待。希望不需要靠保证结果来成立，也可以来自眼前的小进展。",
    "advice": "记录一件正在变好的小事，给自己一点恢复的空间。"
  },
  {
    "id": "major-18-moon",
    "name": "月亮",
    "en": "THE MOON",
    "rank": "XVIII",
    "kind": "reflect",
    "keywords": "模糊 · 感受",
    "meaning": "不确定感可能让想象变得很大。感受值得被听见，但它们不一定等于事实。",
    "advice": "在做决定前补齐一条关键事实，避免只凭担忧推断。"
  },
  {
    "id": "major-19-sun",
    "name": "太阳",
    "en": "THE SUN",
    "rank": "XIX",
    "kind": "connect",
    "keywords": "坦诚 · 喜悦",
    "meaning": "简单、清楚与真实的表达能带来轻松。允许自己看见进展，也可以把喜悦分享给重要的人。",
    "advice": "为一个小成果留个记号，并真诚地表达感谢。"
  },
  {
    "id": "major-20-judgement",
    "name": "审判",
    "en": "JUDGEMENT",
    "rank": "XX",
    "kind": "release",
    "keywords": "回顾 · 回应",
    "meaning": "回看过去，是为了更清楚地选择下一步。你可以承担自己的部分，也不必把自己永远困在旧评价里。",
    "advice": "总结一次经历：保留什么、改变什么、下一步是什么。"
  },
  {
    "id": "major-21-world",
    "name": "世界",
    "en": "THE WORLD",
    "rank": "XXI",
    "kind": "steady",
    "keywords": "完成 · 整合",
    "meaning": "一个阶段值得被认真收尾。看见自己走过的路，把经验整合下来，才更容易轻装进入下一程。",
    "advice": "完成一件悬而未决的小事，再给这段经历一个明确的句点。"
  },
  {
    "id": "wands-01",
    "name": "权杖一",
    "en": "ACE OF WANDS",
    "rank": "A",
    "kind": "begin",
    "keywords": "灵感 · 火花",
    "meaning": "一个想法正在吸引你的注意。先让热情变成小小的实践，再判断它是否值得长期投入。",
    "advice": "给新想法一次短时间的试做，不急着投入全部资源。"
  },
  {
    "id": "wands-02",
    "name": "权杖二",
    "en": "TWO OF WANDS",
    "rank": "II",
    "kind": "reflect",
    "keywords": "规划 · 视野",
    "meaning": "你正在比较不同方向。站远一点看，短期的新鲜感与长期的适合度可能并不相同。",
    "advice": "列出两个选项各自的机会、成本与下一步。"
  },
  {
    "id": "wands-03",
    "name": "权杖三",
    "en": "THREE OF WANDS",
    "rank": "III",
    "kind": "begin",
    "keywords": "拓展 · 等待",
    "meaning": "已有的行动正在向外延伸。观察回应、准备后续，比急着催促每一步更有帮助。",
    "advice": "检查已经发出的请求或计划，补上必要的后续安排。"
  },
  {
    "id": "wands-04",
    "name": "权杖四",
    "en": "FOUR OF WANDS",
    "rank": "IV",
    "kind": "connect",
    "keywords": "安定 · 庆祝",
    "meaning": "稳定的基础与共同的喜悦值得被珍惜。小小的仪式也能让人感受到归属。",
    "advice": "和重要的人确认一个共同完成的成果。"
  },
  {
    "id": "wands-05",
    "name": "权杖五",
    "en": "FIVE OF WANDS",
    "rank": "V",
    "kind": "adjust",
    "keywords": "碰撞 · 磨合",
    "meaning": "不同意见正在争取空间。分歧不一定是敌意，关键是让讨论围绕具体问题进行。",
    "advice": "先说清共同目标，再逐一讨论不同做法。"
  },
  {
    "id": "wands-06",
    "name": "权杖六",
    "en": "SIX OF WANDS",
    "rank": "VI",
    "kind": "connect",
    "keywords": "认可 · 鼓励",
    "meaning": "付出被看见时，可以坦然接受认可。也别让外界评价成为你衡量自己的唯一尺度。",
    "advice": "记录真实的进步，同时感谢提供帮助的人。"
  },
  {
    "id": "wands-07",
    "name": "权杖七",
    "en": "SEVEN OF WANDS",
    "rank": "VII",
    "kind": "steady",
    "keywords": "立场 · 坚持",
    "meaning": "你可能需要说明自己的立场。守住重要边界，也要辨认哪些争执不值得消耗。",
    "advice": "选择一件真正重要的事坚持，其余留出协商空间。"
  },
  {
    "id": "wands-08",
    "name": "权杖八",
    "en": "EIGHT OF WANDS",
    "rank": "VIII",
    "kind": "begin",
    "keywords": "进展 · 沟通",
    "meaning": "信息和安排可能接连出现。保持回应的清楚与有序，能让行动更顺畅。",
    "advice": "把待回应事项排好顺序，发送前核对内容。"
  },
  {
    "id": "wands-09",
    "name": "权杖九",
    "en": "NINE OF WANDS",
    "rank": "IX",
    "kind": "steady",
    "keywords": "韧性 · 防护",
    "meaning": "过去的辛苦让你更警觉。保持边界有帮助，但不必把每次新接触都当作旧伤重演。",
    "advice": "检查哪些防护仍有必要，给自己安排一次真正的休息。"
  },
  {
    "id": "wands-10",
    "name": "权杖十",
    "en": "TEN OF WANDS",
    "rank": "X",
    "kind": "adjust",
    "keywords": "负担 · 分工",
    "meaning": "承担太多会让原本有意义的事变得沉重。认真负责不等于必须独自完成一切。",
    "advice": "列出可以延期、简化或请人分担的一项任务。"
  },
  {
    "id": "wands-11",
    "name": "权杖侍从",
    "en": "PAGE OF WANDS",
    "rank": "PAGE",
    "kind": "begin",
    "keywords": "探索 · 学习",
    "meaning": "新的兴趣值得被认真对待。允许自己从不熟练开始，用经验检验想象。",
    "advice": "找一个入门练习，完成后再决定是否深入。"
  },
  {
    "id": "wands-12",
    "name": "权杖骑士",
    "en": "KNIGHT OF WANDS",
    "rank": "KNIGHT",
    "kind": "begin",
    "keywords": "热情 · 行动",
    "meaning": "行动力正在被唤起。把热情用在明确方向上，也要注意承诺是否超出实际时间。",
    "advice": "出发前确认资源、时间与可承受的范围。"
  },
  {
    "id": "wands-13",
    "name": "权杖王后",
    "en": "QUEEN OF WANDS",
    "rank": "QUEEN",
    "kind": "connect",
    "keywords": "自信 · 感染力",
    "meaning": "温暖而坚定的表达，可以让你更自然地被看见。你不必缩小自己来换取他人的舒服。",
    "advice": "说出一个真实想法，同时认真听取对方回应。"
  },
  {
    "id": "wands-14",
    "name": "权杖国王",
    "en": "KING OF WANDS",
    "rank": "KING",
    "kind": "steady",
    "keywords": "远见 · 担当",
    "meaning": "你被邀请从更长远的角度组织行动。真正的担当，也包括倾听与合理授权。",
    "advice": "明确目标和分工，让参与的人知道各自负责什么。"
  },
  {
    "id": "cups-01",
    "name": "圣杯一",
    "en": "ACE OF CUPS",
    "rank": "A",
    "kind": "connect",
    "keywords": "敞开 · 感受",
    "meaning": "新的情感体验可能值得关注。先承认自己的感受，再决定如何表达，不必急着定义一切。",
    "advice": "给一种感受起名字，并用简单的话表达它。"
  },
  {
    "id": "cups-02",
    "name": "圣杯二",
    "en": "TWO OF CUPS",
    "rank": "II",
    "kind": "connect",
    "keywords": "互相 · 理解",
    "meaning": "相互尊重与回应是连接的基础。靠近需要双方愿意，也需要清楚的边界。",
    "advice": "安排一次平等的对话，轮流说出需要与期待。"
  },
  {
    "id": "cups-03",
    "name": "圣杯三",
    "en": "THREE OF CUPS",
    "rank": "III",
    "kind": "connect",
    "keywords": "陪伴 · 分享",
    "meaning": "友善的支持能让生活轻一些。允许自己参与小小的聚会或分享，也照顾独处的需求。",
    "advice": "主动联系一个让你感到自在的人。"
  },
  {
    "id": "cups-04",
    "name": "圣杯四",
    "en": "FOUR OF CUPS",
    "rank": "IV",
    "kind": "reflect",
    "keywords": "倦怠 · 留意",
    "meaning": "熟悉的事物可能暂时失去吸引力。给自己一点空间，也留意眼前是否有被忽略的支持。",
    "advice": "先辨认自己是累了，还是确实需要改变。"
  },
  {
    "id": "cups-05",
    "name": "圣杯五",
    "en": "FIVE OF CUPS",
    "rank": "V",
    "kind": "release",
    "keywords": "失落 · 余地",
    "meaning": "失望值得被承认，不必马上振作。同时，眼前可能仍有尚未失去的关系与资源。",
    "advice": "允许自己难过，再写下一件仍能依靠的事。"
  },
  {
    "id": "cups-06",
    "name": "圣杯六",
    "en": "SIX OF CUPS",
    "rank": "VI",
    "kind": "connect",
    "keywords": "回忆 · 善意",
    "meaning": "旧时的经验或熟悉的人，让你想起曾经的需要。珍惜回忆，也让现在的自己拥有新的选择。",
    "advice": "重拾一个简单的好习惯，不强求过去完整重来。"
  },
  {
    "id": "cups-07",
    "name": "圣杯七",
    "en": "SEVEN OF CUPS",
    "rank": "VII",
    "kind": "reflect",
    "keywords": "想象 · 选择",
    "meaning": "多个可能性看起来各有吸引力。想象可以提供灵感，但具体条件仍需逐项确认。",
    "advice": "选一个最重要的标准，用事实筛掉不适合的选项。"
  },
  {
    "id": "cups-08",
    "name": "圣杯八",
    "en": "EIGHT OF CUPS",
    "rank": "VIII",
    "kind": "release",
    "keywords": "离开 · 寻找",
    "meaning": "某件事也许已不能满足你更深的需要。离开与留下都需要认真评估，而不只是逃开眼前的不适。",
    "advice": "写清想离开的原因，以及改变之后需要的支持。"
  },
  {
    "id": "cups-09",
    "name": "圣杯九",
    "en": "NINE OF CUPS",
    "rank": "IX",
    "kind": "connect",
    "keywords": "满足 · 珍惜",
    "meaning": "你可以承认已经拥有的满足，而不必马上追逐下一个目标。享受与节制可以同时存在。",
    "advice": "为一件已经实现的小愿望留出享受的时间。"
  },
  {
    "id": "cups-10",
    "name": "圣杯十",
    "en": "TEN OF CUPS",
    "rank": "X",
    "kind": "connect",
    "keywords": "归属 · 和谐",
    "meaning": "共同的价值与相互支持，是归属感的重要部分。理想关系也需要日常的照顾与沟通。",
    "advice": "和重要的人一起安排一件让双方舒适的小事。"
  },
  {
    "id": "cups-11",
    "name": "圣杯侍从",
    "en": "PAGE OF CUPS",
    "rank": "PAGE",
    "kind": "connect",
    "keywords": "细腻 · 新意",
    "meaning": "一个温柔的想法或感受，值得被轻轻接住。保持好奇，不必因不够成熟就立刻否定它。",
    "advice": "用写字、绘画或对话表达一个尚未说出的感受。"
  },
  {
    "id": "cups-12",
    "name": "圣杯骑士",
    "en": "KNIGHT OF CUPS",
    "rank": "KNIGHT",
    "kind": "connect",
    "keywords": "表达 · 邀请",
    "meaning": "真诚的邀请能为关系打开空间。让言语与行动一致，也尊重对方的节奏。",
    "advice": "提出一个具体而没有压力的邀约。"
  },
  {
    "id": "cups-13",
    "name": "圣杯王后",
    "en": "QUEEN OF CUPS",
    "rank": "QUEEN",
    "kind": "connect",
    "keywords": "体察 · 照顾",
    "meaning": "你可能很能感受到他人的情绪。关心别人之前，也需要辨认哪些感受属于自己。",
    "advice": "倾听时保留自己的边界，不替别人承担所有情绪。"
  },
  {
    "id": "cups-14",
    "name": "圣杯国王",
    "en": "KING OF CUPS",
    "rank": "KING",
    "kind": "steady",
    "keywords": "包容 · 稳定",
    "meaning": "情绪可以被容纳，而不必立刻决定行动。稳稳地表达，需要诚实，也需要分寸。",
    "advice": "先整理自己的感受，再用平静的语言提出请求。"
  },
  {
    "id": "swords-01",
    "name": "宝剑一",
    "en": "ACE OF SWORDS",
    "rank": "A",
    "kind": "reflect",
    "keywords": "清晰 · 判断",
    "meaning": "一句诚实的话或一个清楚的判断，可能帮助你理顺局面。直接表达也可以保有善意。",
    "advice": "用一句话写清真正要解决的问题。"
  },
  {
    "id": "swords-02",
    "name": "宝剑二",
    "en": "TWO OF SWORDS",
    "rank": "II",
    "kind": "reflect",
    "keywords": "犹豫 · 权衡",
    "meaning": "暂时不选，也是在承受一种结果。先看清缺少什么信息，再判断是否还需要等待。",
    "advice": "为决定列出必要信息和合理期限。"
  },
  {
    "id": "swords-03",
    "name": "宝剑三",
    "en": "THREE OF SWORDS",
    "rank": "III",
    "kind": "release",
    "keywords": "难过 · 诚实",
    "meaning": "某些事实或话语可能触动伤口。允许感受存在，并寻找安全、可信的表达与支持。",
    "advice": "把痛苦说给可信任的人听，不用急着装作没事。"
  },
  {
    "id": "swords-04",
    "name": "宝剑四",
    "en": "FOUR OF SWORDS",
    "rank": "IV",
    "kind": "reflect",
    "keywords": "休息 · 整理",
    "meaning": "持续思考也会让人疲惫。暂时把问题放下，有时是恢复判断力的一部分。",
    "advice": "为自己留一段不处理事务的休息时间。"
  },
  {
    "id": "swords-05",
    "name": "宝剑五",
    "en": "FIVE OF SWORDS",
    "rank": "V",
    "kind": "adjust",
    "keywords": "争执 · 代价",
    "meaning": "争赢一时未必能保住真正重视的东西。留意沟通是否正在变成互相消耗。",
    "advice": "暂停无效争论，重新确认你希望达成的结果。"
  },
  {
    "id": "swords-06",
    "name": "宝剑六",
    "en": "SIX OF SWORDS",
    "rank": "VI",
    "kind": "release",
    "keywords": "过渡 · 支持",
    "meaning": "从困难处境走向更稳定的位置，往往需要一个过程。接受帮助并不削弱你的能力。",
    "advice": "安排一个可以逐步改善现状的过渡步骤。"
  },
  {
    "id": "swords-07",
    "name": "宝剑七",
    "en": "SEVEN OF SWORDS",
    "rank": "VII",
    "kind": "reflect",
    "keywords": "策略 · 透明",
    "meaning": "有些事情需要谨慎筹划，也需要注意信息是否完整。聪明的方法不应建立在隐瞒关键责任上。",
    "advice": "核对约定与事实，对自己承担的部分保持透明。"
  },
  {
    "id": "swords-08",
    "name": "宝剑八",
    "en": "EIGHT OF SWORDS",
    "rank": "VIII",
    "kind": "reflect",
    "keywords": "限制 · 余地",
    "meaning": "你感受到的限制可能是真实的，也可能有部分来自惯常想法。先寻找一个小小的可选空间。",
    "advice": "写下一项仍由自己决定的行动，从那里开始。"
  },
  {
    "id": "swords-09",
    "name": "宝剑九",
    "en": "NINE OF SWORDS",
    "rank": "IX",
    "kind": "reflect",
    "keywords": "担忧 · 求助",
    "meaning": "反复担心会让问题显得更大。把脑中的推演写下来，有助于分辨事实与最坏的想象。",
    "advice": "把一个担忧转成具体问题，必要时寻求合适支持。"
  },
  {
    "id": "swords-10",
    "name": "宝剑十",
    "en": "TEN OF SWORDS",
    "rank": "X",
    "kind": "release",
    "keywords": "止损 · 收尾",
    "meaning": "某种消耗可能已到需要停止的程度。这张牌象征艰难阶段的结束，不是身体伤害的预言。",
    "advice": "停止一件明显无益的反复尝试，先安排恢复。"
  },
  {
    "id": "swords-11",
    "name": "宝剑侍从",
    "en": "PAGE OF SWORDS",
    "rank": "PAGE",
    "kind": "reflect",
    "keywords": "好奇 · 核实",
    "meaning": "敏锐的观察能带来新问题。保持好奇的同时，别把零散线索过早拼成确定结论。",
    "advice": "多问一个澄清问题，再转述或行动。"
  },
  {
    "id": "swords-12",
    "name": "宝剑骑士",
    "en": "KNIGHT OF SWORDS",
    "rank": "KNIGHT",
    "kind": "begin",
    "keywords": "果断 · 节奏",
    "meaning": "你可能想尽快把事情推进。速度很有用，但需要与事实、分寸和他人的承受度相配合。",
    "advice": "行动前再核对一个最关键的条件。"
  },
  {
    "id": "swords-13",
    "name": "宝剑王后",
    "en": "QUEEN OF SWORDS",
    "rank": "QUEEN",
    "kind": "reflect",
    "keywords": "边界 · 直言",
    "meaning": "清楚表达自己的标准，可以减少误解。坚定不必尖锐，独立也不等于拒绝支持。",
    "advice": "用具体事实说明边界，避免对人格下判断。"
  },
  {
    "id": "swords-14",
    "name": "宝剑国王",
    "en": "KING OF SWORDS",
    "rank": "KING",
    "kind": "steady",
    "keywords": "理性 · 责任",
    "meaning": "判断需要证据，也需要承担相应后果。把规则说清楚，让人知道决定如何形成。",
    "advice": "比较事实与依据，再作出能解释清楚的选择。"
  },
  {
    "id": "pentacles-01",
    "name": "星币一",
    "en": "ACE OF PENTACLES",
    "rank": "A",
    "kind": "begin",
    "keywords": "机会 · 落地",
    "meaning": "一个实际的起点需要被细心培养。看见机会之后，资源、时间与持续投入同样重要。",
    "advice": "把想法拆成一项可以验证的小行动。"
  },
  {
    "id": "pentacles-02",
    "name": "星币二",
    "en": "TWO OF PENTACLES",
    "rank": "II",
    "kind": "adjust",
    "keywords": "协调 · 弹性",
    "meaning": "多项事务需要轮流照顾。弹性不是无止境地兼顾，而是清楚地安排优先顺序。",
    "advice": "重新排一遍时间或预算，为变化留点余量。"
  },
  {
    "id": "pentacles-03",
    "name": "星币三",
    "en": "THREE OF PENTACLES",
    "rank": "III",
    "kind": "connect",
    "keywords": "协作 · 专业",
    "meaning": "不同专长的配合能让成果更扎实。尊重彼此的贡献，也把标准与责任讲清楚。",
    "advice": "确认分工，并邀请一次具体的反馈。"
  },
  {
    "id": "pentacles-04",
    "name": "星币四",
    "en": "FOUR OF PENTACLES",
    "rank": "IV",
    "kind": "steady",
    "keywords": "安全 · 松紧",
    "meaning": "想守住已有的东西很自然。留意保护是否变成过度紧握，让生活失去必要的流动。",
    "advice": "检查一项资源安排，区分必要储备与过度控制。"
  },
  {
    "id": "pentacles-05",
    "name": "星币五",
    "en": "FIVE OF PENTACLES",
    "rank": "V",
    "kind": "adjust",
    "keywords": "匮乏 · 支持",
    "meaning": "缺乏感可能让人缩回自己的角落。先承认现实困难，再找可获得的实际帮助。",
    "advice": "列出一条可联系的支持渠道，迈出求助的一步。"
  },
  {
    "id": "pentacles-06",
    "name": "星币六",
    "en": "SIX OF PENTACLES",
    "rank": "VI",
    "kind": "connect",
    "keywords": "给予 · 互惠",
    "meaning": "帮助与接受都需要分寸。健康的交换会尊重双方的能力，而不是让人感到亏欠。",
    "advice": "明确自己能提供什么、需要什么，以及合理边界。"
  },
  {
    "id": "pentacles-07",
    "name": "星币七",
    "en": "SEVEN OF PENTACLES",
    "rank": "VII",
    "kind": "reflect",
    "keywords": "耐心 · 评估",
    "meaning": "已经投入的事，需要时间也需要检视。继续坚持之前，看看方法是否还适合当前目标。",
    "advice": "设一个复盘节点，依据实际进展调整投入。"
  },
  {
    "id": "pentacles-08",
    "name": "星币八",
    "en": "EIGHT OF PENTACLES",
    "rank": "VIII",
    "kind": "steady",
    "keywords": "练习 · 累积",
    "meaning": "细小而持续的练习，能慢慢变成可靠的能力。注意方法与反馈，而不只是重复次数。",
    "advice": "选一个具体技巧，有意识地练习并记录反馈。"
  },
  {
    "id": "pentacles-09",
    "name": "星币九",
    "en": "NINE OF PENTACLES",
    "rank": "IX",
    "kind": "steady",
    "keywords": "独立 · 享受",
    "meaning": "你可以看见自己积累的能力与成果。独立意味着更多选择，不意味着所有事都要独自承担。",
    "advice": "为一个已经做到的成果庆祝，并维持支持你的习惯。"
  },
  {
    "id": "pentacles-10",
    "name": "星币十",
    "en": "TEN OF PENTACLES",
    "rank": "X",
    "kind": "steady",
    "keywords": "长远 · 根基",
    "meaning": "长久的稳定来自日常积累与共同安排。眼前的决定，也可以考虑重要关系与长期责任。",
    "advice": "和相关的人确认一个长期计划或共同约定。"
  },
  {
    "id": "pentacles-11",
    "name": "星币侍从",
    "en": "PAGE OF PENTACLES",
    "rank": "PAGE",
    "kind": "begin",
    "keywords": "务实 · 学习",
    "meaning": "新的技能或计划，需要耐心从基础开始。小步学习，比只设想最终成果更能带来踏实感。",
    "advice": "安排一次具体学习，并把学到的内容用起来。"
  },
  {
    "id": "pentacles-12",
    "name": "星币骑士",
    "en": "KNIGHT OF PENTACLES",
    "rank": "KNIGHT",
    "kind": "steady",
    "keywords": "可靠 · 持续",
    "meaning": "稳步推进也有自己的力量。认真完成每一步，同时留意是否需要适时调整方法。",
    "advice": "为重要事项设置可持续的进度，按时检查。"
  },
  {
    "id": "pentacles-13",
    "name": "星币王后",
    "en": "QUEEN OF PENTACLES",
    "rank": "QUEEN",
    "kind": "connect",
    "keywords": "照顾 · 实际",
    "meaning": "关怀也可以体现在环境、资源和日常安排里。照顾自己，是照顾他人的一部分。",
    "advice": "改善一个每天都会接触的小环境或习惯。"
  },
  {
    "id": "pentacles-14",
    "name": "星币国王",
    "en": "KING OF PENTACLES",
    "rank": "KING",
    "kind": "steady",
    "keywords": "稳健 · 经营",
    "meaning": "经验与耐心可以支持更稳妥的安排。成熟的经营也包括节制、责任和对风险的了解。",
    "advice": "检查资源与承诺是否匹配，优先守住长期基础。"
  }
];
