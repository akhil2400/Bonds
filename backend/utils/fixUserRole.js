// Script to fix user roles for trusted members
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const TRUSTED_MEMBER_EMAILS = [
  'akhilathul56@gmail.com', // Your actual registered email
  'friend2@example.com',
  'friend3@example.com', 
  'friend4@example.com'
];

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles for trusted members...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');
    
    // Update all trusted member emails
    for (const email of TRUSTED_MEMBER_EMAILS) {
      const result = await User.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            role: 'member',
            isTrustedMember: true 
          }
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated ${email} - Role: member, Trusted: true`);
      } else {
        console.log(`⚠️  User not found: ${email}`);
      }
    }
    
    // Show all users and their roles
    console.log('\n📋 Current user roles:');
    const users = await User.find({}, 'name email role isTrustedMember').sort({ email: 1 });
    
    users.forEach(user => {
      const status = user.isTrustedMember ? '🔑 TRUSTED' : '👁️  VIEWER';
      console.log(`   ${user.email} - ${user.role.toUpperCase()} ${status}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ User roles updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixUserRoles();