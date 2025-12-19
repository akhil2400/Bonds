// Test utility for image cropping functionality
// This can be used in browser console to test cropping

export const testImageCropping = () => {
  console.log('🧪 Testing Image Cropping Functionality');
  
  // Test 1: Validate crop coordinate conversion
  const testCrop = {
    unit: '%',
    x: 10,
    y: 15,
    width: 70,
    height: 60
  };
  
  const mockImage = {
    naturalWidth: 1000,
    naturalHeight: 800,
    width: 500,
    height: 400
  };
  
  // Convert percentage to pixels
  const cropX = (testCrop.x / 100) * mockImage.naturalWidth;
  const cropY = (testCrop.y / 100) * mockImage.naturalHeight;
  const cropWidth = (testCrop.width / 100) * mockImage.naturalWidth;
  const cropHeight = (testCrop.height / 100) * mockImage.naturalHeight;
  
  console.log('✅ Crop Coordinate Test:', {
    input: testCrop,
    output: { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
    expected: { x: 100, y: 120, width: 700, height: 480 }
  });
  
  // Test 2: Boundary checking
  const boundaryTest = (x, y, width, height, maxWidth, maxHeight) => {
    const safeX = Math.max(0, Math.min(x, maxWidth));
    const safeY = Math.max(0, Math.min(y, maxHeight));
    const safeWidth = Math.min(width, maxWidth - safeX);
    const safeHeight = Math.min(height, maxHeight - safeY);
    
    return { x: safeX, y: safeY, width: safeWidth, height: safeHeight };
  };
  
  const boundaryResult = boundaryTest(cropX, cropY, cropWidth, cropHeight, 1000, 800);
  console.log('✅ Boundary Check Test:', boundaryResult);
  
  // Test 3: File validation
  const testFile = {
    name: 'test-image.jpg',
    type: 'image/jpeg',
    size: 2 * 1024 * 1024 // 2MB
  };
  
  try {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    const isValidType = validTypes.includes(testFile.type);
    const isValidSize = testFile.size <= maxSize;
    
    console.log('✅ File Validation Test:', {
      file: testFile,
      validType: isValidType,
      validSize: isValidSize,
      result: isValidType && isValidSize ? 'PASS' : 'FAIL'
    });
  } catch (error) {
    console.error('❌ File Validation Error:', error);
  }
  
  console.log('🎉 All tests completed! Check results above.');
};

// Auto-run test if in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to auto-test
  // testImageCropping();
}