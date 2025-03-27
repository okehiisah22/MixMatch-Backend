declare module 'autocannon';
import autocannon from 'autocannon';
import { spawn } from 'child_process';
import jwt from 'jsonwebtoken';

// Start the server in a separate process
const server = spawn('node', ['dist/server.js'], {
  env: { ...process.env, PORT: '3001' }
});

// Generate a bunch of valid tokens
const generateTokens = (count: number) => {
  return Array(count).fill(0).map((_, i) => 
    jwt.sign(
      { userId: `load-test-user-${i}`, exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET || 'test-secret'
    )
  );
};

const tokens = generateTokens(1000);

// Define the test configuration
const loadTest = async () => {
  const result = await autocannon({
    url: 'http://localhost:3001',
    connections: 100,
    duration: 10,
    requests: [
      {
        method: 'POST',
        path: '/auth/logout',
        headers: {
          'Content-Type': 'application/json',
          // Use a different token for each request to test blacklist insertion performance
          'Authorization': () => `Bearer ${tokens[Math.floor(Math.random() * tokens.length)]}`
        }
      }
    ]
  });

  console.log('Load test results:');
  console.log(autocannon.printResult(result));
  
  // Kill the server process
  server.kill();
};

// Run the test
loadTest().catch(error => {
  console.error('Load test failed:', error);
  server.kill();
  process.exit(1);
}); 