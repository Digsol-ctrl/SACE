import fs from 'fs';

async function run() {
  try {
    console.log('Attempting login...');
    const loginRes = await fetch('http://localhost:3000/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: 'admin', password: '1234' }),
      redirect: 'manual'
    });

    console.log('Login status:', loginRes.status);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('Login set-cookie:', setCookie);
    if (!setCookie) {
      console.error('Login failed, no cookie.');
      process.exit(1);
    }
    const cookie = setCookie.split(';')[0];
    console.log('Got cookie:', cookie);

    const form = new FormData();
    form.append('title', 'Node Test');
    form.append('category', 'Test');
    form.append('caption', 'Uploaded by script');
    form.append('image', fs.createReadStream(new URL('../public/images/logo.png', import.meta.url)));

    console.log('Uploading image...');
    const uploadRes = await fetch('http://localhost:3000/admin/gallery', {
      method: 'POST',
      headers: { Cookie: cookie },
      body: form,
      redirect: 'manual'
    });

    console.log('Upload status:', uploadRes.status);
    const text = await uploadRes.text();
    console.log('Upload response text length:', text.length);
    console.log('Upload response preview:', text.slice(0, 200));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();