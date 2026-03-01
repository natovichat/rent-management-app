/**
 * Test script to verify projectedValue and rentalIncome fields fix
 * 
 * This script:
 * 1. Creates a test property with projectedValue and rentalIncome
 * 2. Updates the property with different values
 * 3. Verifies no validation errors occur
 */

const API_URL = 'http://localhost:3001';
const TEST_ACCOUNT_ID = 'test-account-1';

interface CreatePropertyDto {
  address: string;
  fileNumber?: string;
  type?: string;
  status?: string;
  city?: string;
  country?: string;
  estimatedValue?: number;
  acquisitionPrice?: number;
  rentalIncome?: number;
  projectedValue?: number;
}

async function testProjectedValueFix() {
  console.log('🧪 Testing projectedValue and rentalIncome fields fix...\n');

  // Step 1: Create property with new fields
  console.log('Step 1: Creating test property with rentalIncome and projectedValue...');
  const createData: CreatePropertyDto = {
    address: 'רחוב בדיקה 456, תל אביב',
    fileNumber: 'TEST-FIX-001',
    type: 'RESIDENTIAL',
    status: 'OWNED',
    city: 'תל אביב',
    country: 'ישראל',
    estimatedValue: 2000000,
    acquisitionPrice: 1500000,
    rentalIncome: 6000,  // NEW FIELD
    projectedValue: 2500000,  // NEW FIELD
  };

  try {
    const createResponse = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-account-id': TEST_ACCOUNT_ID,
      },
      body: JSON.stringify(createData),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('❌ Create failed:', error);
      throw new Error(`Create failed: ${JSON.stringify(error)}`);
    }

    const createdProperty = await createResponse.json();
    console.log('✅ Property created successfully!');
    console.log(`   ID: ${createdProperty.id}`);
    console.log(`   Address: ${createdProperty.address}`);
    console.log(`   Rental Income: ${createdProperty.rentalIncome}`);
    console.log(`   Projected Value: ${createdProperty.projectedValue}\n`);

    // Step 2: Update property with different values
    console.log('Step 2: Updating property with new rentalIncome and projectedValue...');
    const updateData = {
      rentalIncome: 7500,
      projectedValue: 2800000,
      estimatedValue: 2200000,
    };

    const updateResponse = await fetch(`${API_URL}/properties/${createdProperty.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-account-id': TEST_ACCOUNT_ID,
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('❌ Update failed:', error);
      throw new Error(`Update failed: ${JSON.stringify(error)}`);
    }

    const updatedProperty = await updateResponse.json();
    console.log('✅ Property updated successfully!');
    console.log(`   Rental Income: ${updatedProperty.rentalIncome} (was 6000)`);
    console.log(`   Projected Value: ${updatedProperty.projectedValue} (was 2500000)`);
    console.log(`   Estimated Value: ${updatedProperty.estimatedValue} (was 2000000)\n`);

    // Step 3: Verify retrieval
    console.log('Step 3: Retrieving property to verify data...');
    const getResponse = await fetch(`${API_URL}/properties/${createdProperty.id}`, {
      headers: {
        'x-account-id': TEST_ACCOUNT_ID,
      },
    });

    if (!getResponse.ok) {
      const error = await getResponse.json();
      console.error('❌ Get failed:', error);
      throw new Error(`Get failed: ${JSON.stringify(error)}`);
    }

    const retrievedProperty = await getResponse.json();
    console.log('✅ Property retrieved successfully!');
    console.log(`   Rental Income: ${retrievedProperty.rentalIncome}`);
    console.log(`   Projected Value: ${retrievedProperty.projectedValue}\n`);

    // Verify values match
    const errors = [];
    if (retrievedProperty.rentalIncome !== 7500) {
      errors.push(`rentalIncome mismatch: expected 7500, got ${retrievedProperty.rentalIncome}`);
    }
    if (parseFloat(retrievedProperty.projectedValue) !== 2800000) {
      errors.push(`projectedValue mismatch: expected 2800000, got ${retrievedProperty.projectedValue}`);
    }

    if (errors.length > 0) {
      console.error('❌ Verification failed:');
      errors.forEach(err => console.error(`   - ${err}`));
      throw new Error('Verification failed');
    }

    console.log('✅ All checks passed!\n');
    console.log('='.repeat(60));
    console.log('🎉 SUCCESS: projectedValue and rentalIncome are working correctly!');
    console.log('='.repeat(60));

    // Cleanup
    console.log('\nCleaning up test property...');
    await fetch(`${API_URL}/properties/${createdProperty.id}`, {
      method: 'DELETE',
      headers: {
        'x-account-id': TEST_ACCOUNT_ID,
      },
    });
    console.log('✅ Test property deleted.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the test
testProjectedValueFix().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
