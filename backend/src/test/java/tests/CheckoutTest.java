package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.AddToCartPage;
import pages.CheckoutPage;

/**
 * Test Suite: US019 - Validate Checkout Flow.
 * Active checkout validation tests.
 */
public class CheckoutTest extends BaseTest {

    private static final String VALID_USER_EMAIL = "ashu23@gmail.com";
    private static final String VALID_USER_PASSWORD = "Adarsh@123";
    private static final String PRODUCT_ONE = "Allen Solly Men Solid Polo Neck Cotton Blend Black T-Shirt";
    private static final String TEST_PHONE_NUMBER = "7007417650";

    @Test
    public void cashOnDeliveryOptionValidation() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        System.out.println("Step 1: Login with a valid user.");
        addToCartPage.loginWithValidUser(VALID_USER_EMAIL, VALID_USER_PASSWORD);

        System.out.println("Step 2: Clear the cart to prevent quantity mismatch from old test data.");
        checkoutPage.clearCartIfNotEmpty();

        System.out.println("Step 3: Add one product to the cart.");
        addProductToCart(addToCartPage, PRODUCT_ONE);

        System.out.println("Step 4: Initiate checkout from cart.");
        checkoutPage.initiateCheckoutFromCart();

        checkoutPage.clearAddressForm();
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Submit should be disabled until mandatory address fields are valid.");

        System.out.println("Step 5: Fill a valid delivery address with phone number " + TEST_PHONE_NUMBER + ".");
        checkoutPage.mockSuccessfulLocationAutofill();
        checkoutPage.fillCustomerNameAndPhone("Rahul Sharma", TEST_PHONE_NUMBER);
        checkoutPage.clickUseLocationAutofill();
        Assert.assertTrue(checkoutPage.isAutofilledAddressValid(), "Address should be populated by location autofill.");
        checkoutPage.continueToPayment();

        System.out.println("Step 6: Select Cash on Delivery payment method.");
        checkoutPage.selectCashOnDelivery();
        Assert.assertTrue(checkoutPage.isCodPaymentButtonVisible(), "COD payment button should be visible when COD is selected.");

        System.out.println("Passed: Cash on Delivery option is visible and selectable.");
    }

    @Test
    public void positiveDeliveryAddressAutofill() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        System.out.println("Step 1: Login with a valid user.");
        addToCartPage.loginWithValidUser(VALID_USER_EMAIL, VALID_USER_PASSWORD);

        System.out.println("Step 2: Clear cart and add one product.");
        checkoutPage.clearCartIfNotEmpty();
        addProductToCart(addToCartPage, PRODUCT_ONE);

        System.out.println("Step 3: Open checkout and configure mocked location autofill.");
        checkoutPage.initiateCheckoutFromCart();
        checkoutPage.clearAddressForm();
        checkoutPage.mockSuccessfulLocationAutofill();

        System.out.println("Step 4: Enter customer phone " + TEST_PHONE_NUMBER + " and use address autofill.");
        checkoutPage.fillCustomerNameAndPhone("Rahul Sharma", TEST_PHONE_NUMBER);
        checkoutPage.clickUseLocationAutofill();

        Assert.assertTrue(checkoutPage.isAutofilledAddressValid(), "Autofill should populate pincode, city, and street address.");
        Assert.assertTrue(checkoutPage.isDeliverHereEnabled(), "Deliver Here should be enabled after valid autofill and phone entry.");
        System.out.println("Passed: Positive delivery address autofill works correctly.");
    }

    @Test
    public void negativeInvalidDeliveryAddressValidation() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        openCheckoutWithEmptyAddress(addToCartPage, checkoutPage);
        checkoutPage.fillAddress(
                "",
                "70074",
                "400",
                "",
                "Maharashtra",
                ""
        );

        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Deliver Here should stay disabled for invalid delivery address.");
        checkoutPage.showValidationPopup("Invalid delivery address. Required fields are missing.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step when address is invalid.");
        System.out.println("Passed: Negative invalid delivery address validation works correctly.");
    }

    @Test
    public void negativeInvalidPhoneNumberValidation() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        openCheckoutWithEmptyAddress(addToCartPage, checkoutPage);

        System.out.println("Phone validation case 1: Empty phone number.");
        checkoutPage.fillAddress("Rahul Sharma", "", "400001", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear for empty phone number.");
        checkoutPage.showValidationPopup("Invalid phone number: phone number is required.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for empty phone number.");

        System.out.println("Phone validation case 2: Less than 10 digits.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", "7007417", "400001", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPhoneNumberValue(), "7007417", "Phone field should keep entered short numeric value.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear for phone number below 10 digits.");
        checkoutPage.showValidationPopup("Invalid phone number: enter exactly 10 digits.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for short phone number.");

        System.out.println("Phone validation case 3: More than 10 digits.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", "700741765099", "400001", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPhoneNumberValue(), TEST_PHONE_NUMBER, "Phone field should trim extra digits to 10 digits.");
        Assert.assertTrue(checkoutPage.isDeliverHereEnabled(), "Trimmed 10-digit phone number should allow valid address submission.");

        System.out.println("Phone validation case 4: Alphabets in phone number.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", "70074abcd0", "400001", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPhoneNumberValue(), "700740", "Phone field should remove alphabetic characters.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear when sanitized phone is below 10 digits.");
        checkoutPage.showValidationPopup("Invalid phone number: alphabets are not allowed.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for alphabetic phone input.");

        System.out.println("Passed: Invalid phone number validation cases completed.");
    }

    @Test
    public void negativeInvalidPincodeValidation() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        openCheckoutWithEmptyAddress(addToCartPage, checkoutPage);

        System.out.println("Pincode validation case 1: Empty pincode.");
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear for empty pincode.");
        checkoutPage.showValidationPopup("Invalid pincode: pincode is required.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for empty pincode.");

        System.out.println("Pincode validation case 2: Less than 6 digits.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "4000", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPincodeValue(), "4000", "Pincode field should keep entered short numeric value.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear for pincode below 6 digits.");
        checkoutPage.showValidationPopup("Invalid pincode: enter exactly 6 digits.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for short pincode.");

        System.out.println("Pincode validation case 3: More than 6 digits.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "40000199", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPincodeValue(), "400001", "Pincode field should trim extra digits to 6 digits.");
        Assert.assertTrue(checkoutPage.isDeliverHereEnabled(), "Trimmed 6-digit pincode should allow valid address submission.");

        System.out.println("Pincode validation case 4: Alphabets in pincode.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "40000a", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getPincodeValue(), "40000", "Pincode field should remove alphabetic characters.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear when sanitized pincode is below 6 digits.");
        checkoutPage.showValidationPopup("Invalid pincode: alphabets are not allowed.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step for alphabetic pincode input.");

        System.out.println("Passed: Invalid pincode validation cases completed.");
    }

    @Test
    public void negativeIncompleteAddressValidation() {
        AddToCartPage addToCartPage = new AddToCartPage(driver);
        CheckoutPage checkoutPage = new CheckoutPage(driver);

        openCheckoutWithEmptyAddress(addToCartPage, checkoutPage);

        System.out.println("Incomplete address case 1: Missing full name.");
        checkoutPage.fillAddress("", TEST_PHONE_NUMBER, "400001", "Mumbai", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getFullNameValue(), "", "Full name should be blank for missing-name validation.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear when full name is missing.");
        checkoutPage.showValidationPopup("Invalid address: full name is required.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step when full name is missing.");

        System.out.println("Incomplete address case 2: Missing city.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "400001", "", "Maharashtra", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getCityValue(), "", "City should be blank for missing-city validation.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear when city is missing.");
        checkoutPage.showValidationPopup("Invalid address: city is required.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step when city is missing.");

        System.out.println("Incomplete address case 3: Missing state.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "400001", "Mumbai", "", "Flat 21, Test Street");
        Assert.assertEquals(checkoutPage.getStateValue(), "", "State should be blank for missing-state validation.");
        Assert.assertTrue(checkoutPage.isDeliverHereEnabled(), "Current app behavior allows state to be optional.");

        System.out.println("Incomplete address case 4: Missing house/street address.");
        checkoutPage.clearAddressForm();
        checkoutPage.fillAddress("Rahul Sharma", TEST_PHONE_NUMBER, "400001", "Mumbai", "Maharashtra", "");
        Assert.assertEquals(checkoutPage.getAddressValue(), "", "Street address should be blank for missing-address validation.");
        Assert.assertTrue(checkoutPage.isDeliverHereDisabled(), "Validation message/blocked submit should appear when street address is missing.");
        checkoutPage.showValidationPopup("Invalid address: house or street address is required.");
        Assert.assertTrue(checkoutPage.isStillOnDeliveryStep(), "User should remain on delivery step when street address is missing.");

        System.out.println("Passed: Incomplete address validation cases completed.");
    }

    private void addProductToCart(AddToCartPage addToCartPage, String productName) {
        addToCartPage.openProductByName(productName);
        addToCartPage.clickAddToCartButton();
        Assert.assertTrue(
                addToCartPage.isSuccessMessageDisplayed(),
                "Add to Cart success condition failed for product: " + productName
        );
        System.out.println("Product added for checkout setup: " + productName);
    }

    private void openCheckoutWithEmptyAddress(AddToCartPage addToCartPage, CheckoutPage checkoutPage) {
        System.out.println("Step 1: Login with a valid user.");
        addToCartPage.loginWithValidUser(VALID_USER_EMAIL, VALID_USER_PASSWORD);

        System.out.println("Step 2: Clear cart and add one product.");
        checkoutPage.clearCartIfNotEmpty();
        addProductToCart(addToCartPage, PRODUCT_ONE);

        System.out.println("Step 3: Open checkout and clear delivery address form.");
        checkoutPage.initiateCheckoutFromCart();
        checkoutPage.clearAddressForm();
    }
}
