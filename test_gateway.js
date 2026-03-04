
const token = '722ef5620a5541fdd8e43d0485b994b65b1a1f610bbf9572';
const url = 'http://127.0.0.1:18789/v1/chat/completions';

async function testGateway() {
    console.log('--- Testing OpenClaw Gateway ---');
    console.log('Target:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'ollama-cloud/qwen3-coder:480b-cloud',
                messages: [
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 50
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ Error:', data.error.message || data.error);
            console.log('Full Error Data:', JSON.stringify(data, null, 2));
        } else if (!data.choices) {
            console.error('❌ Unexpected Response Format (no choices):');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('✅ Success!');
            console.log('Response:', data.choices[0].message.content);
        }
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    }
}

testGateway();
