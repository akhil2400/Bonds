const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * Script to update trusted member roles in the database
 * This ensures all trusted email addresses have the correct 'member' role
 * Reads .env file directly to avoid caching issues
 */

// Read .env file directly
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse .env content
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      envVars[key] = value;
    }
  }
});

console.log('🔍 Parsed .env variables:');
console.log('MONGO_URI length:', envVars.MONGO_URI ? envVars.MONGO_URI.length : 'undefined');
console.log('TRUSTED_EMAIL_1:', envVars.TRUSTED_EMAIL_1);
console.log('TRUSTED_EMAIL_4:', envVars.TRUSTED_EMAIL_4);

// Set environment variables
Object.keys(envVars).forEach(key => {
  process.env[key] = envVars[key];
});

const TRUSTED_MEMBER_EMAILS = [
  envVars.TRUSTED_EMAIL_1,
  envVars.TRUSTED_EMAIL_2, 
  envVars.TRUSTED_EMAIL_3,
  envVars.TRUSTED_EMAIL_4
].filter(email => email); // Remove any undefined emails

const updateTrustedMembers = async () => {
  try {
    console.log('🔍 Environment variables from .env file:');
    console.log('TRUSTED_EMAIL_1:', envVars.TRUSTED_EMAIL_1);
    console.log('TRUSTED_EMAIL_2:', envVars.TRUSTED_EMAIL_2);
    console.log('TRUSTED_EMAIL_3:', envVars.TRUSTED_EMAIL_3);
    console.log('TRUSTED_EMAIL_4:', envVars.TRUSTED_EMAIL_4);

    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(envVars.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📧 Trusted member emails:', TRUSTED_MEMBER_EMAILS);

    // Update all trusted members to have 'member' role and isTrustedMember flag
    for (const email of TRUSTED_MEMBER_EMAILS) {
      console.log(`\n🔍 Processing: ${email}`);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        const oldRole = user.role;
        const oldTrustedFlag = user.isTrustedMember;
        
        // Update user role and trusted member flag
        user.role = 'member';
        user.isTrustedMember = true;
        await user.save();
        
        console.log(`✅ Updated ${email}:`);
        console.log(`   Role: ${oldRole} → ${user.role}`);
        console.log(`   Trusted: ${oldTrustedFlag} → ${user.isTrustedMember}`);
      } else {
        console.log(`⚠️  User not found: ${email}`);
        console.log('   This user needs to sign up first');
      }
    }

    // Also check for any users who should NOT be trusted members
    console.log('\n🔍 Checking for users who should be viewers...');
    const allUsers = await User.find({});
    
    for (const user of allUsers) {
      const shouldBeTrusted = TRUSTED_MEMBER_EMAILS.includes(user.email.toLowerCase());
      
      if (!shouldBeTrusted && (user.role === 'member' || user.role === 'admin')) {
        console.log(`\n🔄 Converting ${user.email} to viewer:`);
        console.log(`   Role: ${user.role} → viewer`);
        console.log(`   Trusted: ${user.isTrustedMember} → false`);
        
        user.role = 'viewer';
        user.isTrustedMember = false;
        await user.save();
        
        console.log(`✅ Updated ${user.email} to viewer`);
      }
    }

    console.log('\n📊 Final user summary:');
    const finalUsers = await User.find({}).select('name email role isTrustedMember');
    
    finalUsers.forEach(user => {
      const status = TRUSTED_MEMBER_EMAILS.includes(user.email.toLowerCase()) ? '👑 TRUSTED' : '👤 VIEWER';
      console.log(`${status} | ${user.email} | ${user.role} | Trusted: ${user.isTrustedMember}`);
    });

    console.log('\n🎉 Trusted member update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating trusted members:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
updateTrustedMembers();