package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.ProductListingPage;

public class ProductListingTest extends BaseTest {

    @Test
    public void verifyProductListingPage() throws InterruptedException {

        // Open homepage
        HomePage homePage = new HomePage(driver);

        // Click "For You" tab to load products
        homePage.clickForYou();

        // Create Product Listing Page object
        ProductListingPage productPage =
                new ProductListingPage(driver);

        // Wait for products to load
        productPage.waitForProductsToLoad();

        // Scroll till last product card
        productPage.scrollToLastProduct();

        // Get total products displayed
        int productCount =
                productPage.getProductCount();

        System.out.println(
                "Total Products Found: "
                        + productCount
        );

        // Verify products are displayed
        Assert.assertTrue(
                productCount > 0,
                "No products are displayed on homepage."
        );

        // Verify multiple products are displayed
        Assert.assertTrue(
                productCount > 1,
                "Multiple products are not displayed on homepage."
        );

        // Verify product images
        Assert.assertTrue(
                productPage.isProductImageVisible(),
                "One or more product images are not visible."
        );

        // Verify product names
        Assert.assertTrue(
                productPage.isProductNameVisible(),
                "One or more product names are not visible."
        );

        // Verify product prices
        Assert.assertTrue(
                productPage.isProductPriceVisible(),
                "One or more product prices are not visible."
        );

        // Print all product names
        productPage.printAllProductNames();

        // Print first product details
        System.out.println(
                "First Product Name: "
                        + productPage.getProductName(0)
        );

        System.out.println(
                "First Product Price: "
                        + productPage.getProductPrice(0)
        );

        System.out.println(
                "Product Listing Page verification completed successfully."
        );
    }
}