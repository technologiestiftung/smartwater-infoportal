import { getHazardData } from '../../../src/server/actions/getHazardData';
import { GeoServerClient } from '../../../src/lib/geoserverClient';

// Integration test - uses REAL GeoServer (no mocks)
describe('getHazardData Integration Test', () => {
  const testCoordinates = {
    longitude: 13.4118329,
    latitude: 52.5003982
  };

  beforeAll(async () => {
    // Test if GeoServer is available
    const geoServer = new GeoServerClient();
    try {
      const isConnected = await geoServer.testConnection();
      if (!isConnected) {
        console.warn('⚠️  GeoServer not available - skipping integration tests');
      }
    } catch (error) {
      console.warn('⚠️  GeoServer connection failed:', error);
    }
  });

  it('should connect to real GeoServer and return valid data', async () => {
    console.log(`🌐 Testing real GeoServer with coordinates: ${testCoordinates.longitude}, ${testCoordinates.latitude}`);
    
    const result = await getHazardData(testCoordinates.longitude, testCoordinates.latitude);
    
    // Log the actual result for debugging
    console.log('📊 Real GeoServer result:', JSON.stringify(result, null, 2));
    
    // Basic structure validation
    expect(result).toHaveProperty('found');
    expect(result).toHaveProperty('starkregenGefährdung');
    expect(result).toHaveProperty('hochwasserGefährdung');
    expect(result).toHaveProperty('maxGefährdung');
    
    // The result should be either found with data OR legitimately not found (no errors)
    if (result.found) {
      expect(result.starkregenGefährdung).toBeGreaterThanOrEqual(0);
      expect(result.hochwasserGefährdung).toBeGreaterThanOrEqual(0);
      expect(result.maxGefährdung).toBeGreaterThanOrEqual(0);
      
      if (result.building) {
        console.log('✅ Building match found');
        expect(result.building).toHaveProperty('uuid');
      }
    } else {
      console.log('ℹ️  No buildings found at this location (but no errors occurred)');
    }
  }, 10000); // 10 second timeout for network requests

  it('should test GeoServer connection directly', async () => {
    const geoServer = new GeoServerClient();
    
    console.log('🔗 Testing GeoServer connection...');
    const connectionResult = await geoServer.testConnection();
    
    if (connectionResult) {
      console.log('✅ GeoServer connection successful');
      expect(connectionResult).toBe(true);
    } else {
      console.log('❌ GeoServer connection failed');
      console.log('🔍 Check:');
      console.log('   - Is GeoServer running on http://localhost:8085?');
      console.log('   - Does the Smartwater workspace exist?');
      console.log('   - Is the alkis layer published?');
      
      // Fail the test if GeoServer is not available
      expect(connectionResult).toBe(true);
    }
  }, 5000);
});