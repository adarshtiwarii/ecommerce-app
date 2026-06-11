package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.ProductDetailsPage;
import pages.ProductListingPage;

public class ProductDetailsTest extends BaseTest {

    @Test
    public void verifyProductDetailsAndNavigation()
            throws InterruptedException {

        // Open product listing
        HomePage homePage =
                new HomePage(driver);

        homePage.clickForYou();

        ProductListingPage listingPage =
                new ProductListingPage(driver);

        listingPage.waitForProductsToLoad();

        // Open first product
        listingPage.clickProductByName("vivo X200T (Seaside Lilac, 256 GB) (12 GB RAM)");

        ProductDetailsPage detailsPage =
                new ProductDetailsPage(driver);

        detailsPage.waitForPageToLoad();

        // Verify first product page
        Assert.assertTrue(
                detailsPage.isOnProductDetailPage(),
                "Product detail page not opened."
        );

        Assert.assertTrue(
                detailsPage.isProductNameVisible(),
                "Product name not displayed."
        );

        Assert.assertTrue(
                detailsPage.isPriceVisible(),
                "Product price not displayed."
        );

        Assert.assertTrue(
                detailsPage.isProductImageVisible(),
                "Product image not displayed."
        );

        System.out.println(
                "\nFirst Product Details"
        );

        System.out.println(
                "Name : "
                        + detailsPage.getProductName()
        );

        System.out.println(
                "Price : "
                        + detailsPage.getProductPrice()
        );

        System.out.println(
                "MRP : "
                        + detailsPage.getProductMRP()
        );

        System.out.println(
                "Discount : "
                        + detailsPage.getDiscountText()
        );

        System.out.println(
                "Stock Status : "
                        + detailsPage.getStockStatus()
        );

        System.out.println(
                "Description : "
                        + detailsPage.getDescriptionText()
        );

        System.out.println(
                "Specifications : "
                        + detailsPage.getSpecificationsText()
        );

        System.out.println(
                "Reviews : "
                        + detailsPage.getReviewsText()
        );

        // Back to listing page
        detailsPage.goBackToListing();

        // React page reload
        homePage.clickForYou();

        listingPage.waitForProductsToLoad();

        // Open second product
        listingPage.clickProductByName("APPLE iPhone 17");
        detailsPage.waitForPageToLoad();

        // Verify second product page
        Assert.assertTrue(
                detailsPage.isOnProductDetailPage(),
                "Second product detail page not opened."
        );

        Assert.assertTrue(
                detailsPage.isProductNameVisible(),
                "Second product name not displayed."
        );

        Assert.assertTrue(
                detailsPage.isPriceVisible(),
                "Second product price not displayed."
        );

        Assert.assertTrue(
                detailsPage.isProductImageVisible(),
                "Second product image not displayed."
        );

        System.out.println(
                "\nSecond Product Details"
        );

        System.out.println(
                "Name : "
                        + detailsPage.getProductName()
        );

        System.out.println(
                "Price : "
                        + detailsPage.getProductPrice()
        );

        System.out.println(
                "MRP : "
                        + detailsPage.getProductMRP()
        );

        System.out.println(
                "Discount : "
                        + detailsPage.getDiscountText()
        );

        System.out.println(
                "Stock Status : "
                        + detailsPage.getStockStatus()
        );

        System.out.println(
                "Description : "
                        + detailsPage.getDescriptionText()
        );
        System.out.println(
                "Specifications : "
                        + detailsPage.getSpecificationsText()
        );

        System.out.println(
                "Reviews : "
                        + detailsPage.getReviewsText()
        );

        System.out.println(
                "\nProduct details validation completed successfully."
        );
    }
}