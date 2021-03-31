
const chalk = require('chalk')
const msgPath = process.env.GIT_PARAMS
const msg = require('fs')
  .readFileSync(msgPath, 'utf-8')
  .trim()

/**
 * revert: 回滚某次commit
 * feat 新功能
 * fix bug修复
 * docs 文档修改
 * style 格式变动，不影响运行结果
 * refactor  重构
 * test  单元测试
 * build  构建或者辅助工具变动
 * chore  杂项，不包含源代码
 * ci 自动流程工具
 * perf  性能相关
 * types  ts 类型定义
 */
const commitRE = /^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|chore|types|ci)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      `invalid commit message format.`
    )}\n\n` +
      chalk.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${chalk.green(`feat(xx): add 'comments' option`)}\n` +
      `    ${chalk.green(
        `fix(xx): bugfix (INS-xxx)`
      )}\n`
  )
  process.exit(1)
}