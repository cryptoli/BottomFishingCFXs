# 抄底CFXs
## 概述
该项目涉及与 Conflux 区块链上的 CFXs 智能合约进行交互。脚本使用 Ethereum 的 ethers 库进行合约交互，使用 axios 从特定 cfxs官方市场获取数据，抄底CFXs！

## 安装
在运行脚本之前，请确保您的计算机上已安装 Node.js。您可以使用以下命令安装所需的依赖项：
```
npm install
```
## 配置
只需要修改config.json 的文件的privateKey，其余不动：
```
{
    "privateKey": "0x",
    "url": "https://evm.confluxrpc.com",
    "CFXsAddress": "0xd3a4d837e0a7b40de0b4024fa0f93127dd47b8b8",
    "limitAmount": 500,
    "limitPrice:": 0.1,
    "frequency": 10000
}
```
将 privateKey 替换为您的实际私钥；limitAmount表示每次需要抄底的最大数量；limitPrice表示抄底阈值，大于该值不抄底;frequency是指抄底频率，默认10秒一次，设置的时候需要转换为毫秒，设置10则填写100000。

## 执行
要运行脚本，请执行以下命令：
```
node cfxs.js
```