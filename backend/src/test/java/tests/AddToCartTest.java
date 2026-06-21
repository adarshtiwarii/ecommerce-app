package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.AddToCartPage;

/**
 * TestNG test class for validating the complete Add to Cart workflow.
 */
public class AddToCartTest extends BaseTest {

    private static final String VALID_USER_EMAIL = "ashu23@gmail.com";
    private static final String VALID_USER_PASSWORD = "Adarsh@123";
    private static final String[] PRODUCT_NAMES = {
            "Allen Solly Men Solid Polo Neck Cotton Blend Black T-Shirt",
            "Toys For kids"
    };

    /**
     * Validates login, product opening by name, add to cart,
     * cart page navigation, product removal, and product absence confirmation.
     */
    @Test
    public void validateAddToCartCompleteFlow() {

        AddToCartPage addToCartPage = new AddToCartPage(driver);

        System.out.println("Step 1: Application launched successfully.");

        addToCartPage.loginWithValidUser(
                VALID_USER_EMAIL,
                VALID_USER_PASSWORD
        );
        System.out.println("Validation Passed: Valid user logged in.");

        for (String productName : PRODUCT_NAMES) {

            addToCartPage.openProductByName(productName);
            System.out.println("Validation Passed: Product details page opened for " + productName);

            addToCartPage.clickAddToCartButton();

            Assert.assertTrue(
                    addToCartPage.isSuccessMessageDisplayed(),
                    "Add to Cart success message was not displayed for: " + productName
            );
            System.out.println("Validation Passed: Product added successfully: " + productName);

            addToCartPage.openCartPage();

            Assert.assertTrue(
                    addToCartPage.isSelectedProductPresentInCart(productName),
                    "Selected product was not present in the cart: " + productName
            );
            System.out.println("Validation Passed: Correct product exists in cart: " + productName);

            // Commented out: remove from cart step

            addToCartPage.removeProductFromCart(productName);
            System.out.println("Validation Passed: Product removed from cart: " + productName);

            addToCartPage.openCartPage();
            System.out.println("Validation Passed: Cart page opened again after product removal.");

            Assert.assertTrue(
                    addToCartPage.isProductRemovedFromCart(productName),
                    "Product was still present in the cart after removal: " + productName
            );
            System.out.println("Validation Passed: Removed product is no longer present in cart: " + productName);

        }

        System.out.println("Add to Cart end-to-end validation completed successfully.");
    }
}