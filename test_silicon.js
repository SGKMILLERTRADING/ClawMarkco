
const apiKey = '8ec67bcd09e741f39b6c804ef835c069.bDC7CwSmhKmj9n8JZeYld-kN';
const url = 'https://api.siliconflow.cn/v1/chat/completions';

async function testSilicon() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-V3',
                messages: [{ role: 'user', content: 'say hi' }],
                max_tokens: 10
            })
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testSilicon();
