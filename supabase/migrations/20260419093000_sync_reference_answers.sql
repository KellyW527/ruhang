update tasks
set
  standard_answer = $$# 财务报表勾稽分析工作底稿摘要

## 一、总体结论
鼎盛建材 2021–2023 年及 2024Q3 财务数据整体可勾稽，但经营性现金流与净利润背离、应收增长快于收入、存货周转放缓三处异常需要继续核实。

## 二、重点核查结论

| 模块 | 核查结果 | 结论 |
| --- | --- | --- |
| 收入与收现 | 收现率低于行业均值 | 需追问账期与回款结构 |
| 净利润与现金流 | 背离扩大 | 关注收入质量与备货节奏 |
| 固定资产与资本开支 | 存在小额差异 | 排查非现金资产置换 |

## 三、建议下一步
1. 拉客户维度明细，拆大客户回款节奏。
2. 复盘库存结构，确认新增产能对周转的真实影响。
3. 在管理层访谈中增加对合同负债和渠道返点的追问。$$,
  boss_commentary = '结构已经接近可交付版本，下一步要把异常点写得更像核查结论，而不是简单罗列差异。'
from simulations
where tasks.simulation_id = simulations.id
  and simulations.code in ('ibd-ipo', 'ib-huarui')
  and tasks.order_index = 2;

update tasks
set
  standard_answer = $$# 投资备忘录摘要

## 一、项目结论
拾野生活具备“品牌心智 + 轻资产供应链 + 内容转化”的增长基础，但目前仍需验证复购和获客效率是否能支撑中期估值。

## 二、核心判断框架

### 1. 为什么值得继续看
- 创始团队对消费品牌与渠道节奏理解较强
- 线上 DTC 模型验证初步成立
- 产品延展有可能从装备走向生活方式

### 2. 为什么不能现在就拍板
- 复购尚未稳定
- 投流成本上升后 CAC 回收期变长
- 品牌溢价是否足够支撑扩品类仍需证据

## 三、建议
1. 第二轮访谈重点追问渠道质量与复购逻辑。
2. 拉月度 cohort 看用户迁移和留存。
3. 用可比品牌估值做上下限测算。$$,
  boss_commentary = '备忘录最重要的是判断链路要闭环，先给结论，再写证据，不要堆素材。'
from simulations
where tasks.simulation_id = simulations.id
  and simulations.code in ('pe-growth', 'pe-zhiyuan')
  and tasks.order_index = 2;

update tasks
set
  standard_answer = $$# HRM SaaS 行业研究框架摘要

## 一、研究目标
建立 HRM SaaS 行业研究框架，明确市场边界、核心指标体系、可比公司与估值逻辑。

## 二、建议章节
1. 市场空间与渗透率
2. 产品矩阵与价值链位置
3. 商业模式与关键指标
4. 竞争格局与可比公司
5. 盈利预测与估值讨论

## 三、分析重点
- 大客户与 SMB 客户在销售效率和续费率上的差异
- NDR、毛利率、Rule of 40 对估值的影响
- 海外成熟公司对国内公司的映射边界

## 四、下一步
先把 6–8 家可比公司数据表搭起来，再把市场空间假设写成可讨论版本。$$,
  boss_commentary = '研究框架已经有了骨架，下一步是把每个判断后面的数据证据补完整。'
from simulations
where tasks.simulation_id = simulations.id
  and simulations.code in ('er-new-energy', 'er-mingxin')
  and tasks.order_index = 0;
