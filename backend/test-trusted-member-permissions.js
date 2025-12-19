require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { getUserPermissions } = require('./middlewares/authorization');

async function testTrustedMemberPermissions() {
  console.log('🧪 Testing Trusted Member Permissions...\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test with existing trusted members
    const trustedEmails = [
      'akhilathul56@gmail.com',
      'athithyatkd@gmail.com', 
      'bhosaleasleshiya990@gmail.com'
    ];
    
    for (const email of trustedEmails) {
      console.log(`\n👤 Testing permissions for: ${email}`);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      console.log(`📋 User data:`, {
        name: user.name,
        email: user.email,
        role: user.role,
        isTrustedMember: user.isTrustedMember
      });
      
      // Test permissions
      const permissions = getUserPermissions(user);
      
      console.log(`🔐 Permissions:`, {
        canView: permissions.canView,
        canCreate: permissions.canCreate,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
        isAdmin: permissions.isAdmin,
        isTrustedMember: permissions.isTrustedMember, // ✅ This should now be included
        role: permissions.role
      });
      
      // Verify trusted member status
      if (permissions.isTrustedMember) {
        console.log('✅ Trusted member status: CORRECT (icon should show)');
      } else {
        console.log('❌ Trusted member status: INCORRECT (icon will not show)');
      }
    }
    
    console.log('\n🎉 Trusted member permissions test completed!');
    
  } catch (error) {
    console.error('❌ Error testing permissions:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testTrustedMemberPermissions();