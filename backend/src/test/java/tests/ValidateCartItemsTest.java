package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.AddToCartPage;

/**
 * Validates cart item display, quantity update, and total price calculation.
 */
public class ValidateCartItemsTest extends BaseTest {

    private static final String VALID_USER_EMAIL = "ashu23@gmail.com";
    private static final String VALID_USER_PASSWORD = "Adarsh@123";
    private static final String PRODUCT_NAME = "Allen Solly Men Solid Polo Neck Cotton Blend Black T-Shirt";

    @Test
    public void T091_verifyQuantityAndPriceInCart() {

        AddToCartPage addToCartPage = new AddToCartPage(driver);

        addToCartPage.loginWithValidUser(
                VALID_USER_EMAIL,
                VALID_USER_PASSWORD
        );
        System.out.println("Validation Passed: Valid user logged in.");

        addToCartPage.openProductByName(PRODUCT_NAME);
        System.out.println("Validation Passed: Product opened: " + PRODUCT_NAME);

        addToCartPage.clickAddToCartButton();
        Assert.assertTrue(
                addToCartPage.isSuccessMessageDisplayed(),
                "Product was not added to the cart."
        );
        System.out.println("Validation Passed: Product added to cart.");

        addToCartPage.openCartPage();
        Assert.assertTrue(
                addToCartPage.isSelectedProductPresentInCart(PRODUCT_NAME),
                "Correct product is not displayed in the cart."
        );
        System.out.println("Validation Passed: Correct product displayed in cart.");

        int initialQuantity = addToCartPage.getProductQuantity(PRODUCT_NAME);
        Assert.assertEquals(initialQuantity, 1, "Initial cart quantity should be 1.");

        addToCartPage.slowlyScrollToTotalPriceSection();
        int initialTotalPrice = addToCartPage.getTotalPrice();
        System.out.println("Before update -> Quantity: " + initialQuantity + ", Total Price: " + initialTotalPrice);

        addToCartPage.increaseProductQuantity(PRODUCT_NAME);
        int increasedQuantity = addToCartPage.getProductQuantity(PRODUCT_NAME);
        Assert.assertEquals(increasedQuantity, 2, "Quantity should increase to 2.");

        addToCartPage.slowlyScrollToTotalPriceSection();
        int increasedTotalPrice = addToCartPage.getTotalPrice();
        System.out.println("After increase -> Quantity: " + increasedQuantity + ", Total Price: " + increasedTotalPrice);

        Assert.assertTrue(
                increasedTotalPrice > initialTotalPrice,
                "Total Price should increase after increasing quantity."
        );

        addToCartPage.decreaseProductQuantity(PRODUCT_NAME);
        int decreasedQuantity = addToCartPage.getProductQuantity(PRODUCT_NAME);
        Assert.assertEquals(decreasedQuantity, 1, "Quantity should decrease back to 1.");

        addToCartPage.slowlyScrollToTotalPriceSection();
        int decreasedTotalPrice = addToCartPage.getTotalPrice();
        System.out.println("After decrease -> Quantity: " + decreasedQuantity + ", Total Price: " + decreasedTotalPrice);

        Assert.assertEquals(
                decreasedTotalPrice,
                initialTotalPrice,
                "Total Price should return to the initial value after decreasing quantity."
        );

        Assert.assertTrue(
                addToCartPage.isCartFunctional(),
                "Cart should remain functional after quantity changes."
        );
        System.out.println("Validation Passed: Cart remains functional throughout quantity changes.");
    }
}
