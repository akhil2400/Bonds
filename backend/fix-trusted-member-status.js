require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Trusted member emails from environment
const TRUSTED_EMAILS = [
  process.env.TRUSTED_EMAIL_1,
  process.env.TRUSTED_EMAIL_2,
  process.env.TRUSTED_EMAIL_3,
  process.env.TRUSTED_EMAIL_4
].filter(Boolean);

async function fixTrustedMemberStatus() {
  console.log('🔧 Fixing Trusted Member Status...\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('🔍 Trusted emails to check:', TRUSTED_EMAILS);
    
    for (const email of TRUSTED_EMAILS) {
      console.log(`\n📧 Checking user: ${email}`);
      
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      console.log(`👤 Found user: ${user.name} (${user.email})`);
      console.log(`📋 Current status:`, {
        role: user.role,
        isTrustedMember: user.isTrustedMember,
        isVerified: user.isVerified
      });
      
      // Check if user needs to be updated
      const needsUpdate = !user.isTrustedMember || user.role === 'viewer';
      
      if (needsUpdate) {
        console.log('🔄 Updating user status...');
        
        // Update user to be a trusted member
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            role: user.role === 'admin' ? 'admin' : 'member',
            isTrustedMember: true,
            isVerified: true
          },
          { new: true }
        );
        
        console.log(`✅ Updated user: ${updatedUser.name}`);
        console.log(`📋 New status:`, {
          role: updatedUser.role,
          isTrustedMember: updatedUser.isTrustedMember,
          isVerified: updatedUser.isVerified
        });
      } else {
        console.log('✅ User already has correct trusted member status');
      }
    }
    
    console.log('\n🎉 Trusted member status fix completed!');
    
    // Verify all trusted members
    console.log('\n🔍 Final verification:');
    for (const email of TRUSTED_EMAILS) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`✅ ${user.email}: ${user.role} (trusted: ${user.isTrustedMember})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing trusted member status:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixTrustedMemberStatus();