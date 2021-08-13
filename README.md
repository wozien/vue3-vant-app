
## 开始

安装并启动

```bash
yarn && yarn dev
```

类型检验

```bash
yarn type-checked 
# 或者
npx tsc --noEmit
```

eslint 语法校验

```base
yarn lint
```

打包

```base
yarn build:uat # 灰度

yarn build:prod # 生产
```

git 提交 
```base
yarn commit
```

> VS 安装插件 `Volar` 获取更好开发体验, 然后可以开启实时的类型检查

```json
{
  "volar.tsPlugin": true
}
```

## 开发分支规范

- 在 `master` 分支迁出自己的开发分支

- 提交开发分支合并 `master` 的 pr

- 在 `uat/prod` 分支拉去合并 `master` 分支，提交分支进行部署


## 自动部署 Jenkins

在提交分支 `uat` 或者 `prod` 就会触发对应的 `Jenkins` 对应的自动部署流程， 并且构建最新的前端镜像

灰度配置文件：`./docker/Jenkinsfile.uat`

生产配置文件： `./docker/Jenkinsfile`

控制面板地址: [http://jenkins.studio-dev.insuite.net/](http://jenkins.studio-dev.insuite.net/)  insuite/instudio2020
