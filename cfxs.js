
const { Contract, JsonRpcProvider, Wallet } = require('ethers');
const axios = require('axios');
const config = require('./config.json');
const cfxsMainMeta = require('./CFXsMain.json');

const provider = new JsonRpcProvider(config.url);
const cfxsMainContract = new Contract(config.CFXsAddress, cfxsMainMeta.abi, provider);
const wallet = new Wallet(config.privateKey, provider);
let cfxsMainContract1 = cfxsMainContract.connect(wallet);

async function fetchData() {
    const url = `https://www.cfxs.world/api/shop?index=0&price_asc=0&merged=0&quantity_min=0&recently=0&size=24`;
    try {
        const response = await axios.get(url);
        const data = response.data.rows.map(entry => ({ id: parseInt(entry.id), price: entry.amount, quantity: entry.quantity, unitPrice: entry.unitprice }));
        // console.log("从市场获取数据条数：", data.length);
        return data;
    } catch (error) {
        console.error('从市场获取数据失败:', error.message);
        return null;
    }
}

async function callUnlockingScriptbatch(limitAmount, limitPrice) {
    const idObjects = await fetchData();
    const selectedIds = [];
    const pricesArray = [];
    const USDArray = [];
    let totalPrice = 0;

    let currentTotal = 0;

    for (let index = 0; index < idObjects.length; index++) {
        const idObject = idObjects[index];
        // 判断均价是否符合条件
        if(parseFloat(idObject.unitPrice) > parseFloat(limitPrice)) {
            continue;
        }
        // 如果当前cfxs太多，就不抄底这个
        if (currentTotal + parseInt(idObject.quantity) > limitAmount) {
            continue;
        }
        // 每次循环都把id放到selectedIds数组里
        selectedIds.push(idObject.id);
        // 每次循环都把idObject里面的price*10^18放到pricesArray数组里
        pricesArray.push(String(idObject.price * 10 ** 18));
        // 支付类型
        USDArray.push("0");
        // 更新当前总量
        currentTotal += parseInt(idObject.quantity);
        // 累加总price
        totalPrice += parseFloat(idObject.price);
    }
    if(currentTotal === 0){
        console.log("暂无符合条件单")
        return;
    }
    console.log("本次抄底Ids：", selectedIds, "数量：", currentTotal, "总价：", totalPrice)
    try {
        // 调用区块链交易处理函数
        const tx = await cfxsMainContract1.UnlockingScriptbatch(selectedIds, USDArray, pricesArray);
        await tx.wait();

        console.log('抄底成功!');
    } catch (error) {
        console.error('抄底失败:', error);
    }
}

async function run() {
    while (true) {
        await callUnlockingScriptbatch(config.limitAmount, config.limitPrice);
      await new Promise(resolve => setTimeout(resolve, config.frequency));
    }
  }

run()