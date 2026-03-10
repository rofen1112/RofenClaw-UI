#!/usr/bin/env node
/**
 * 24Konbini 注册可用性检查脚本
 * 定时运行，检测注册 API 是否可用
 */

const https = require('https');

const TEST_URL = 'api.24konbini.com';
const TEST_PATH = '/api/agents/check-name?name=test';

function checkAvailability() {
    return new Promise((resolve) => {
        const options = {
            hostname: TEST_URL,
            path: TEST_PATH,
            method: 'GET',
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            // 只要能连接上，不管返回什么状态码都算成功
            resolve({
                available: true,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
            });
        });

        req.on('error', (e) => {
            resolve({
                available: false,
                error: e.message,
                timestamp: new Date().toISOString()
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                available: false,
                error: 'timeout',
                timestamp: new Date().toISOString()
            });
        });

        req.end();
    });
}

async function main() {
    const result = await checkAvailability();
    
    console.log('[' + result.timestamp + ']');
    
    if (result.available) {
        console.log('✅ 注册 API 已可用！');
        console.log('状态码:', result.statusCode);
        console.log('\n可以开始注册了！运行:');
        console.log('  npx konbini@latest join');
        process.exit(0);
    } else {
        console.log('❌ 注册 API 仍不可用');
        console.log('错误:', result.error);
        console.log('\n建议: 继续等待或尝试其他环境');
        process.exit(1);
    }
}

main();
