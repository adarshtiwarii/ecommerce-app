package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.ProductListingPage;

public class ProductSearchAndFilterTest extends BaseTest {

    private static final String SEARCH_KEYWORD =
            "vivo X200T";

    private static final String EXPECTED_PRODUCT_NAME =
            "vivo X200T (Seaside Lilac, 256 GB) (12 GB RAM)";

    // Same keyword used for filter test — product exists in DB
    private static final String FILTER_TEST_KEYWORD =
            "vivo X200T";

    @Test
    public void verifySearchByProductNameDisplaysCorrectProduct() {

        ProductListingPage listingPage =
                new ProductListingPage(driver);

        // Search the product from navbar search field
        listingPage.searchByProductName(SEARCH_KEYWORD);

        Assert.assertTrue(
                listingPage.getProductCount() > 0,
                "No products were displayed after search."
        );

        Assert.assertTrue(
                listingPage.areAllProductsMatchingSearch(SEARCH_KEYWORD),
                "Search results contain products that do not match the searched product name."
        );

        Assert.assertTrue(
                listingPage.isProductDisplayed(EXPECTED_PRODUCT_NAME),
                "Expected searched product is not displayed in search results."
        );

        System.out.println(
                "Search functionality test completed successfully."
        );
    }

    @Test
    public void verifyProductFiltersAndReset() {

        ProductListingPage listingPage =
                new ProductListingPage(driver);

        // Home page is already open from BaseTest setUp
        // Search vivo X200T to land on /search page — product confirmed in DB
        listingPage.searchByProductName(FILTER_TEST_KEYWORD);

        // Wait for search results page to fully render
        listingPage.waitForSearchPageToSettle();
        listingPage.waitForProductsToLoad();

        int totalProductsBeforeFilter =
                listingPage.getProductCount();

        Assert.assertTrue(
                totalProductsBeforeFilter > 0,
                "Search page did not display products before applying filters."
        );

        // Apply price filter Above Rs 50,000 — vivo X200T is above 50k
        listingPage.selectPriceFilter("Above Rs 50,000");
        listingPage.waitForProductsToLoad();

        int filteredProductCount =
                listingPage.getProductCount();

        Assert.assertTrue(
                filteredProductCount > 0,
                "Price filter did not return any products."
        );

        // Verify all displayed product prices are above Rs 50,000
        Assert.assertTrue(
                listingPage.areAllProductPricesWithinRange(50000, 9999999),
                "Price filter returned products outside the selected price range."
        );

        Assert.assertTrue(
                filteredProductCount <= totalProductsBeforeFilter,
                "Filtered product count should not be greater than total product count."
        );

        // Apply rating filter and verify the dynamic radio control remains selected
        listingPage.selectRatingFilter(4);

        Assert.assertTrue(
                listingPage.isRatingFilterSelected(4),
                "Rating filter was not selected correctly."
        );

        // Reset price filter when All prices option is available
        listingPage.resetPriceFilterIfAvailable();

        Assert.assertTrue(
                listingPage.isAllPricesFilterSelected(),
                "Price filter reset did not select All prices."
        );

        Assert.assertTrue(
                listingPage.getProductCount() >= filteredProductCount,
                "Product count did not recover after resetting the price filter."
        );

        System.out.println(
                "Product filter validation test completed successfully."
        );
    }
}