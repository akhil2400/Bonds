const mongoose = require('mongoose');
const User = require('./models/User');
const { isTrustedMember, getUserPermissions, TRUSTED_MEMBER_EMAILS } = require('./middlewares/authorization');

/**
 * Final test script to verify trusted member authorization
 */

const MONGO_URI = 'mongodb+srv://akhilmeet006_db_user:Akhilkrkr2003@cluster0.zs8ml5z.mongodb.net/BONDS?appName=Cluster0';

const testFinalAuth = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 TRUSTED_MEMBER_EMAILS from middleware:', TRUSTED_MEMBER_EMAILS);

    console.log('\n🧪 Testing final authorization for all users:');
    const allUsers = await User.find({}).select('name email role isTrustedMember');
    
    allUsers.forEach(user => {
      const trusted = isTrustedMember(user);
      const permissions = getUserPermissions(user);
      
      const status = trusted ? '👑 TRUSTED MEMBER' : '👤 VIEWER';
      console.log(`\n${status}: ${user.email}`);
      console.log(`   Database Role: ${user.role}`);
      console.log(`   Trusted Flag: ${user.isTrustedMember}`);
      console.log(`   Authorization Result: ${trusted ? 'CAN CREATE/EDIT/DELETE' : 'VIEW ONLY'}`);
      console.log(`   Permissions:`, {
        canView: permissions.canView,
        canCreate: permissions.canCreate,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete
      });
    });

    console.log('\n✅ Final authorization test completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Users who can create/edit/delete content:');
    allUsers.filter(user => isTrustedMember(user)).forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    console.log('\n👀 Users who can only view content:');
    allUsers.filter(user => !isTrustedMember(user)).forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error testing authorization:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testFinalAuth();