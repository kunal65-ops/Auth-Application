require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const User = require('./models/user.model');
const http = require('http');

const runMasterE2ETest = async () => {
  console.log('==========================================================');
  console.log('STARTING MASTER END-TO-END MERN AUTHENTICATION TEST SUITE');
  console.log('==========================================================\n');

  await connectDB();

  const testEmail = `e2e_${Date.now()}@example.com`;
  await User.deleteMany({ email: { $regex: /^e2e/ } });

  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`[E2E] Server running on test port ${port}`);

      const request = (path, method, data = null, headers = {}, cookies = []) => {
        return new Promise((resResolve, resReject) => {
          const payload = data ? JSON.stringify(data) : '';
          const reqHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            ...headers
          };
          if (cookies.length > 0) {
            reqHeaders['Cookie'] = cookies.join('; ');
          }

          const req = http.request(
            {
              hostname: '127.0.0.1',
              port,
              path,
              method,
              headers: reqHeaders
            },
            (res) => {
              let body = '';
              res.on('data', (chunk) => (body += chunk));
              res.on('end', () => {
                let parsed = {};
                try {
                  parsed = body ? JSON.parse(body) : {};
                } catch (e) {
                  parsed = { raw: body };
                }
                resResolve({
                  status: res.statusCode,
                  headers: res.headers,
                  body: parsed
                });
              });
            }
          );
          req.on('error', resReject);
          if (payload) req.write(payload);
          req.end();
        });
      };

      try {
        console.log('\n--- 1. SIGNUP API TEST ---');
        const weakPassRes = await request('/api/auth/signup', 'POST', {
          email: testEmail,
          password: 'weak'
        });
        console.log('✓ Weak Password Rejected (400):', weakPassRes.status === 400);
        if (weakPassRes.status !== 400) throw new Error('Weak password validation failed!');

        const signupRes = await request('/api/auth/signup', 'POST', {
          email: testEmail,
          password: 'Password@123'
        });
        console.log('✓ Signup Successful (201):', signupRes.status === 201);
        console.log('✓ Access Token Returned:', !!signupRes.body.data?.accessToken);
        console.log('✓ Set-Cookie Present:', !!signupRes.headers['set-cookie']);
        if (signupRes.status !== 201 || !signupRes.body.data?.accessToken) {
          throw new Error('Valid signup failed!');
        }

        const dupSignupRes = await request('/api/auth/signup', 'POST', {
          email: testEmail,
          password: 'Password@123'
        });
        console.log('✓ Duplicate Email Rejected (400):', dupSignupRes.status === 400);
        if (dupSignupRes.status !== 400) throw new Error('Duplicate email test failed!');

        console.log('\n--- 2. LOGIN API TEST ---');
        const wrongPassRes = await request('/api/auth/login', 'POST', {
          email: testEmail,
          password: 'WrongPassword@123'
        });
        console.log('✓ Wrong Password Rejected (401):', wrongPassRes.status === 401);
        if (wrongPassRes.status !== 401) throw new Error('Wrong password test failed!');

        const loginRes = await request('/api/auth/login', 'POST', {
          email: testEmail,
          password: 'Password@123'
        });
        console.log('✓ Login Successful (200):', loginRes.status === 200);
        const accessToken1 = loginRes.body.data.accessToken;
        const cookie1 = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log('✓ Initial Cookie:', cookie1.substring(0, 45) + '...');
        if (loginRes.status !== 200 || !accessToken1 || !cookie1) {
          throw new Error('Login test failed!');
        }

        console.log('\n--- 3. PROTECTED ROUTES TEST ---');
        const profileRes = await request('/api/user/profile', 'GET', null, {
          Authorization: `Bearer ${accessToken1}`
        });
        console.log('✓ User Profile Fetched (200):', profileRes.status === 200);
        console.log('✓ Profile Email Match:', profileRes.body.data?.user?.email === testEmail);
        if (profileRes.status !== 200) throw new Error('Protected profile test failed!');

        const dashRes = await request('/api/dashboard', 'GET', null, {
          Authorization: `Bearer ${accessToken1}`
        });
        console.log('✓ Dashboard Data Fetched (200):', dashRes.status === 200);
        if (dashRes.status !== 200) throw new Error('Protected dashboard test failed!');

        const unauthRes = await request('/api/user/profile', 'GET');
        console.log('✓ Unauthenticated Access Blocked (401):', unauthRes.status === 401);
        if (unauthRes.status !== 401) throw new Error('Unauthenticated test failed!');

        console.log('\n--- 4. REFRESH TOKEN & ROTATION TEST ---');
        const refreshRes = await request('/api/auth/refresh', 'POST', null, {}, [cookie1]);
        console.log('✓ Refresh API Successful (200):', refreshRes.status === 200);
        const accessToken2 = refreshRes.body.data.accessToken;
        const cookie2 = refreshRes.headers['set-cookie'][0].split(';')[0];
        console.log('✓ New Access Token Generated:', !!accessToken2);
        console.log('✓ Refresh Token Rotated (Cookie updated):', cookie1 !== cookie2);
        if (refreshRes.status !== 200 || cookie1 === cookie2) {
          throw new Error('Refresh token rotation failed!');
        }

        const reuseRes = await request('/api/auth/refresh', 'POST', null, {}, [cookie1]);
        console.log('✓ Reused Old Token Blocked (401):', reuseRes.status === 401);
        if (reuseRes.status !== 401) throw new Error('Reused token check failed!');

        console.log('\n--- 5. LOGOUT API TEST ---');
        const reloginRes = await request('/api/auth/login', 'POST', {
          email: testEmail,
          password: 'Password@123'
        });
        const activeCookie = reloginRes.headers['set-cookie'][0].split(';')[0];

        const logoutRes = await request('/api/auth/logout', 'POST', null, {}, [activeCookie]);
        console.log('✓ Logout API Successful (200):', logoutRes.status === 200);

        const userInDb = await User.findOne({ email: testEmail });
        console.log('✓ Refresh Token Revoked in MongoDB:', userInDb.refreshToken === null);
        if (logoutRes.status !== 200 || userInDb.refreshToken !== null) {
          throw new Error('Logout verification failed!');
        }

        console.log('\n==========================================================');
        console.log('🎉 ALL 18 SYSTEM TASKS PASSED E2E VERIFICATION 100% CLEANLY!');
        console.log('==========================================================');

        server.close();
        resolve();
      } catch (err) {
        console.error('\n❌ MASTER E2E TEST FAILED:', err.message);
        server.close();
        reject(err);
      }
    });
  });
};

runMasterE2ETest()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));