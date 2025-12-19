const mongoose = require('mongoose');
const User = require('./models/User');
const { isTrustedMember, getUserPermissions, TRUSTED_MEMBER_EMAILS } = require('./middlewares/authorization');
require('dotenv').config();

/**
 * Test script to verify trusted member authorization is working correctly
 */

const testTrustedMembers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📧 Configured trusted emails from environment:');
    console.log('TRUSTED_EMAIL_1:', process.env.TRUSTED_EMAIL_1);
    console.log('TRUSTED_EMAIL_2:', process.env.TRUSTED_EMAIL_2);
    console.log('TRUSTED_EMAIL_3:', process.env.TRUSTED_EMAIL_3);
    console.log('TRUSTED_EMAIL_4:', process.env.TRUSTED_EMAIL_4);

    console.log('\n📋 TRUSTED_MEMBER_EMAILS array:', TRUSTED_MEMBER_EMAILS);

    console.log('\n🧪 Testing authorization for all users:');
    const allUsers = await User.find({}).select('name email role isTrustedMember');
    
    allUsers.forEach(user => {
      const trusted = isTrustedMember(user);
      const permissions = getUserPermissions(user);
      
      console.log(`\n👤 ${user.email}:`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Trusted Flag: ${user.isTrustedMember}`);
      console.log(`   Is Trusted Member: ${trusted}`);
      console.log(`   Permissions:`, {
        canView: permissions.canView,
        canCreate: permissions.canCreate,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete
      });
    });

    console.log('\n✅ Authorization test completed!');
    
  } catch (error) {
    console.error('❌ Error testing authorization:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testTrustedMembers();