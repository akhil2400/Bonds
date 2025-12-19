const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Final script to update trusted member roles
 * Uses hardcoded values to avoid environment variable issues
 */

const MONGO_URI = 'mongodb+srv://akhilmeet006_db_user:Akhilkrkr2003@cluster0.zs8ml5z.mongodb.net/BONDS?appName=Cluster0';

const TRUSTED_MEMBER_EMAILS = [
  'adidev140403@gmail.com',
  'akhilathul56@gmail.com', 
  'athithyatkd@gmail.com',
  'bhosaleasleshiya990@gmail.com'
];

const updateTrustedMembers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📧 Final trusted member emails:', TRUSTED_MEMBER_EMAILS);

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

    console.log('\n🎉 Final trusted member update completed successfully!');
    console.log('\n📝 New trusted members (can create/edit/delete content):');
    TRUSTED_MEMBER_EMAILS.forEach(email => {
      console.log(`   ✅ ${email}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating trusted members:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
updateTrustedMembers();