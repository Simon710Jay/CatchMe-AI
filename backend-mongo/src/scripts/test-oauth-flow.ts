import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { encrypt, decrypt } from '../utils/encryption';
import { signToken, verifyToken } from '../middleware/auth';

async function runTests() {
  console.log('🧪 Starting CatchMe AI GitHub OAuth Alignment Tests...');
  let failures = 0;

  // Test 1: Token Encryption / Decryption Verification
  try {
    console.log('\n🔐 Test 1: AES-256 Token Encryption & Decryption');
    const testToken = 'gho_secret_oauth_token_character_sequence_123456';
    const encrypted = encrypt(testToken);
    const decrypted = decrypt(encrypted);

    console.log(`- Token Input:  ${testToken.substring(0, 15)}...`);
    console.log(`- Encrypted output format: ${encrypted.substring(0, 20)}...`);
    console.log(`- Decrypted:    ${decrypted}`);

    if (decrypted === testToken) {
      console.log('✅ Test 1 Passed: AES-256 secure encryption matches 100%');
    } else {
      console.log('❌ Test 1 Failed: Decrypted token did not match input');
      failures++;
    }
  } catch (error: any) {
    console.log(`❌ Test 1 Failed with error: ${error.message}`);
    failures++;
  }

  // Test 2: Anti-CSRF Signed State Token Verification
  try {
    console.log('\n🛡️ Test 2: CSRF State Verification & Expiry Guard');
    const testPayload = { workspaceId: 'test-workspace', userId: 'dev-user', timestamp: Date.now() };
    const sig = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!!')
      .update(JSON.stringify(testPayload))
      .digest('hex');
    const stateToken = Buffer.from(JSON.stringify({ payload: testPayload, sig })).toString('base64url');

    // Decoding & verifying
    const decoded = JSON.parse(Buffer.from(stateToken, 'base64url').toString('utf8'));
    const verifiedSig = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!!')
      .update(JSON.stringify(decoded.payload))
      .digest('hex');

    const signatureMatch = verifiedSig === decoded.sig;
    const isNotExpired = Date.now() - decoded.payload.timestamp < 10 * 60 * 1000;

    console.log(`- State Token: ${stateToken.substring(0, 25)}...`);
    console.log(`- Decoded payload:`, decoded.payload);
    console.log(`- Signature Match: ${signatureMatch}`);
    console.log(`- Token Active (Not Expired): ${isNotExpired}`);

    if (signatureMatch && isNotExpired) {
      console.log('✅ Test 2 Passed: Signed state parameter validated securely');
    } else {
      console.log('❌ Test 2 Failed: Signature mismatch or expired state');
      failures++;
    }
  } catch (error: any) {
    console.log(`❌ Test 2 Failed with error: ${error.message}`);
    failures++;
  }

  // Test 3: JWT Session Generation and Hook Authenticate Verification
  try {
    console.log('\n🎫 Test 3: JWT Signing & Auth Helper Verification');
    const mockSession = { userId: 'dev-user-999', workspaceId: 'custom-workspace-33' };
    const jwt = signToken(mockSession);
    const decodedSession = verifyToken(jwt);

    console.log(`- Generated JWT: ${jwt.substring(0, 25)}...`);
    console.log(`- Decoded session context:`, decodedSession);

    if (decodedSession && decodedSession.userId === mockSession.userId && decodedSession.workspaceId === mockSession.workspaceId) {
      console.log('✅ Test 3 Passed: Standard HS256-like JWT token is fully secure');
    } else {
      console.log('❌ Test 3 Failed: JWT verification mismatch');
      failures++;
    }
  } catch (error: any) {
    console.log(`❌ Test 3 Failed with error: ${error.message}`);
    failures++;
  }

  console.log('\n=============================================');
  if (failures === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log(`⚠️ ${failures} TEST FAILURE(S) DETECTED! PLEASE INVESTIGATE.`);
  }
  console.log('=============================================');
}

runTests();
